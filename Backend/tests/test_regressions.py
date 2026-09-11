import io
import json
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import Mock
import jwt
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import create_app
from extensions import db
from models.user import User
from models.chat import Chat
from models.message_ai import AIMessage
from models.contract import Contract
from middleware.jwt_util import generate_token
from services import ai_service, llm_provider
from services.file_reader_service import extract_text_from_file


@pytest.fixture
def app(monkeypatch):
    monkeypatch.setenv('RAG_ENABLED', 'false')
    app = create_app({'TESTING': True, 'SECRET_KEY': 'test-secret-' * 4, 'SQLALCHEMY_DATABASE_URI': 'sqlite://'})
    with app.app_context():
        db.create_all()
        db.session.add_all([User(id=1,name='Aluno',email='aluno@example.com',is_verified=True),
                            User(id=2,name='Colega',email='colega@example.com',is_verified=True),
                            User(id=3,name='Pendente',email='pendente@example.com',is_verified=False,
                                 verification_code='123456', verification_code_expires_at=datetime.utcnow()+timedelta(minutes=15))])
        db.session.add_all([Chat(id=1,user_id=1,name='Minha conversa'),Chat(id=2,user_id=2,name='Outra conversa')])
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()


def auth(app):
    with app.app_context():
        return {'Authorization': 'Bearer '+generate_token(db.session.get(User,1))}


def test_verified_account_never_receives_token_from_otp(app):
    res=app.test_client().post('/verify-email',json={'email':'aluno@example.com','code':'123456'})
    assert res.status_code == 400 and 'token' not in res.json


def test_otp_is_single_use_and_expires(app):
    c=app.test_client()
    assert c.post('/verify-email',json={'email':'pendente@example.com','code':'000000'}).status_code == 400
    assert c.post('/verify-email',json={'email':'pendente@example.com','code':'123456'}).status_code == 200
    assert c.post('/verify-email',json={'email':'pendente@example.com','code':'123456'}).status_code == 400
    u=db.session.get(User,3);u.is_verified=False;u.verification_code='123456';u.verification_code_expires_at=datetime.utcnow()-timedelta(seconds=1);db.session.commit()
    assert c.post('/verify-email',json={'email':u.email,'code':'123456'}).status_code == 400


def test_tokens_require_expiration(app):
    token=jwt.encode({'id':1},app.config['SECRET_KEY'],algorithm='HS256')
    assert app.test_client().get('/chats/1',headers={'Authorization':'Bearer '+token}).status_code == 401
    expired=jwt.encode({'id':1,'exp':datetime.now(timezone.utc)-timedelta(seconds=1)},app.config['SECRET_KEY'],algorithm='HS256')
    assert app.test_client().get('/chats/1',headers={'Authorization':'Bearer '+expired}).status_code == 401


@pytest.mark.parametrize('value',[None,[], 'text', 12])
def test_invalid_json_is_not_a_server_error(app,value):
    assert app.test_client().post('/login',data=json.dumps(value),content_type='application/json').status_code == 400


def test_legacy_ai_route_checks_chat_owner(app):
    res=app.test_client().post('/ai-messages/',headers=auth(app),json={'user_id':1,'chat_id':2,'prompt':'oi'})
    assert res.status_code == 403


def test_rating_roundtrip_and_owner(app):
    c=app.test_client();headers=auth(app)
    assert c.post('/ratings/',headers=headers,json={'user_id':1,'chat_id':2,'score':4}).status_code == 403
    assert c.post('/ratings/',headers=headers,json={'user_id':1,'chat_id':1,'score':9}).status_code == 400
    r=c.post('/ratings/',headers=headers,json={'user_id':1,'chat_id':1,'score':4,'feedback':'bom'})
    assert r.status_code == 201
    assert c.get('/chats/1/rating',headers=headers).json['score']==4


def test_empty_or_oversized_contract_is_rejected(app):
    for text in ('   ','a'*30001):
        assert app.test_client().post('/contract/analyze',headers=auth(app),json={'user_id':1,'text':text}).status_code == 400


def test_failed_background_job_has_no_risk_score(app,monkeypatch):
    from router import contract_router
    c=Contract(id=1,user_id=1,text='Exemplo',json={},created_at=datetime.utcnow());db.session.add(c);db.session.commit()
    monkeypatch.setattr(contract_router,'analyze_contract_text',Mock(side_effect=RuntimeError('test failure')))
    contract_router.background_analysis(app,1,'Exemplo')
    db.session.expire_all()
    assert db.session.get(Contract,1).json['risk']=={'score':None,'label':'Erro'}


def test_contract_chat_uses_full_saved_text(app,monkeypatch):
    from router import contract_router
    db.session.add(Contract(id=1,user_id=1,text='Texto completo',json={},created_at=datetime.utcnow()));db.session.commit()
    fn=Mock(return_value='Resposta');monkeypatch.setattr(contract_router,'chat_about_contract',fn)
    res=app.test_client().post('/contract/chat',headers=auth(app),json={'contract_id':1,'message':'Explique','context':'Só resumo'})
    assert res.status_code==200
    fn.assert_called_once_with('Explique','Texto completo')


def test_stream_error_is_error_event_and_not_saved(app,monkeypatch):
    from router import message_ai_router
    monkeypatch.setattr(message_ai_router,'get_api_key_for_model',lambda model:'test')
    monkeypatch.setattr(message_ai_router,'check_and_update_title',lambda *args:None)
    def broken(**kwargs):
        yield 'Parcial'
        raise RuntimeError('Provider failure')
    monkeypatch.setattr(message_ai_router,'generate_response_stream',broken)
    res=app.test_client().post('/ai-messages/send-stream',headers=auth(app),json={'chat_id':1,'content':'Pergunta'})
    assert 'event: error' in res.text and '[DONE]' not in res.text
    assert AIMessage.query.count()==0


def test_file_validation_and_rtf():
    with pytest.raises(ValueError):extract_text_from_file(io.BytesIO(b'MZbad'),'fake.txt')
    with pytest.raises(ValueError):extract_text_from_file(io.BytesIO(b'not pdf'),'fake.pdf')
    assert 'Contrato' in extract_text_from_file(io.BytesIO(b'{\\rtf1\\ansi Contrato}'),'test.rtf')


def test_invalid_ai_json_rejected():
    with pytest.raises(ValueError):ai_service.validate_contract_analysis({'summary':'oops','risk':{'score':0}})
    with pytest.raises(ValueError):ai_service.validate_contract_analysis({'summary':'oops','risk':{'score':-3,'label':'Baixo'},'highlights':[]})


def test_openai_options_and_model_allowlist(monkeypatch):
    monkeypatch.setenv('AI_PROVIDER','openai');monkeypatch.setenv('OPENAI_API_KEY','test')
    monkeypatch.setenv('OPENAI_MODEL','gpt-5.6-terra');monkeypatch.setenv('OPENAI_AUX_MODEL','gpt-5.6-luna')
    client=Mock();client.responses.create.return_value=SimpleNamespace(status='completed',output_text='ok',usage=None)
    monkeypatch.setattr(llm_provider,'_openai_client',lambda key:client)
    assert llm_provider.complete('Instruction',[{'role':'user','content':'Hi'}])=='ok'
    options=client.responses.create.call_args.kwargs
    assert options['model']=='gpt-5.6-terra' and options['store'] is False
    assert options['reasoning']['effort']=='low' and options['max_output_tokens']==2400
    with pytest.raises(ValueError):llm_provider.api_key_for_model('unapproved-expensive-model')


def test_all_ai_features_use_shared_provider(monkeypatch):
    responses=iter(['Resposta','{"summary":"Contrato","risk":{"score":10,"label":"Baixo"},"highlights":[]}',
                    'Explicação','Dica','{"doubts":["Contrato"]}','Título', '{"score":1,"summary":"Uso normal"}'])
    fn=Mock(side_effect=lambda *args,**kwargs:next(responses));monkeypatch.setattr(llm_provider,'complete',fn)
    monkeypatch.setattr(ai_service.RAGService,'search_context',lambda q:'FONTE DE TESTE')
    ai_service._cached_insight.cache_clear();ai_service._cached_doubts.cache_clear()
    assert ai_service.generate_response('Aluno',[],'test','gpt-5.6-terra','Oi')=='Resposta'
    assert ai_service.analyze_contract_text('Contrato')['risk']['score']==10
    assert ai_service.chat_about_contract('Oi','Contrato')=='Explicação'
    assert ai_service.generate_dashboard_insight('Aluno','Oi')=='Dica'
    assert ai_service.analyze_user_doubts(['Contrato'])==['Contrato']
    assert ai_service.generate_chat_title('Oi')=='Título'
    assert ai_service.analyze_user_risk_profile(['Oi'])['score']==1
    assert fn.call_count==7
    # Unchanged dashboard inputs reuse the result without another paid call.
    assert ai_service.generate_dashboard_insight('Aluno','Oi')=='Dica'
    assert fn.call_count==7


def test_stream_uses_retrieval(monkeypatch):
    monkeypatch.setattr(ai_service.RAGService,'search_context',lambda q:'FONTE DE TESTE')
    stream=Mock(return_value=iter(['Resposta']));monkeypatch.setattr(llm_provider,'stream',stream)
    assert list(ai_service.generate_response_stream('Aluno',[],'test','gpt-5.6-terra','Oi'))==['Resposta']
    assert 'FONTE DE TESTE' in stream.call_args.args[0]
