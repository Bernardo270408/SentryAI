import importlib.util
import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock
import pytest
from services import llm_provider as llm


def test_json_mode_includes_json_in_input():
    options=llm._options('Return JSON', [{'role':'user','content':'document'}], 'gpt-5.6-terra', 500, True, False)
    assert 'json' in options['input'][0]['content'].lower()
    assert options['input'][1]['content']=='document'


def test_incomplete_stream_is_not_success(monkeypatch):
    events=[SimpleNamespace(type='response.output_text.delta',delta='partial'), SimpleNamespace(type='response.incomplete')]
    session=Mock();session.__enter__=Mock(return_value=session);session.__exit__=Mock(return_value=False)
    session.__iter__=Mock(return_value=iter(events))
    client=Mock();client.responses.stream.return_value=session
    monkeypatch.setattr(llm,'_openai_client',lambda key:client)
    with pytest.raises(RuntimeError):list(llm.stream('Instruction',[{'role':'user','content':'Hi'}],api_key='test',model='gpt-5.6-terra'))


def test_cli_preserves_passwords_and_boolean_arguments():
    cli_path=Path(__file__).resolve().parents[2]/'CLI'
    sys.path.insert(0,str(cli_path))
    try:
        spec=importlib.util.spec_from_file_location('sentry_cli_test',cli_path/'app.py')
        cli=importlib.util.module_from_spec(spec);spec.loader.exec_module(cli)
        parsed=cli.breakdown_command('sentry auth -login password=001234 is_admin=false code=012345')
        assert parsed['args']['password']=='001234'
        assert parsed['args']['code']=='012345'
        assert parsed['args']['is_admin'] is False
    finally:
        sys.path.remove(str(cli_path))
