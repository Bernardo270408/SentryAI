from models.chat import Chat
from extensions import db

class ChatDAO:
	@staticmethod
	def create_chat(user_id, name, rating_id=None):
		chat = Chat(user_id=user_id, name=name,rating_id=rating_id)
		db.session.add(chat)
		db.session.commit()
		return chat

	@staticmethod
	def get_chat_by_id(chat_id):
		return Chat.query.get(chat_id)

	@staticmethod
	def get_chats_by_user(user_id):
		return Chat.query.filter_by(user_id=user_id).all()

	@staticmethod
	def get_all_chats():
		return Chat.query.all()

	@staticmethod
	def update_chat(chat_id, data):
		chat = ChatDAO.get_chat_by_id(chat_id)
		
		if not chat:
			return None
		
		data.pop("id", None)
		data.pop("user_id", None)
		
		chat.update_from_dict(data)
		return chat

	@staticmethod
	def delete_chat(chat_id):
		chat = ChatDAO.get_chat_by_id(chat_id)
		if not chat:
			return False
		db.session.delete(chat)
		db.session.commit()
		return True

	@staticmethod
	def get_messages_formated(chat_id):
		chat = ChatDAO.get_chat_by_id(chat_id)

		messages = chat.user_messages + chat.ai_messages
		messages.sort(key=lambda m: getattr(m, 'created_at', None))

		history = []
  
		for i,message in enumerate(messages):
			if i % 2 == 0:
				history.append({'role':'user','message': message})
			else:
				history.append({'role':'assistaint','message': message})
  
		if not history:
			return None

		return history
	
	def get_rating_by_chat(chat_id):
		chat = ChatDAO.get_chat_by_id(chat_id)
		return chat.rating
	

