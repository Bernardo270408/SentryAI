from models.chat import Chat
from extensions import db

class ChatDAO:
	@staticmethod
	def create_chat(user_id, name):
		chat = Chat(user_id=user_id, name=name)
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
	def get_all_messages_in_chat(chat_id):
		chat = ChatDAO.get_chat_by_id(chat_id)

		messages = chat.user_messages + chat.ai_messages
		messages.sort(key=lambda m: m.timestamp)
  
		if not chat:
			return None

		return messages
