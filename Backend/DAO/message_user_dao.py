from models.message_user import UserMessage
from extensions import db

class UserMessageDAO:
	@staticmethod
	def create_message(user_id, chat_id, content):
		message = UserMessage(user_id=user_id, chat_id=chat_id, content=content)
		db.session.add(message)
		db.session.commit()
		return message

	@staticmethod
	def get_message_by_id(message_id):
		return UserMessage.query.get(message_id)

	@staticmethod
	def get_messages_by_user(user_id):
		return UserMessage.query.filter_by(user_id=user_id).all()

	@staticmethod
	def get_messages_by_chat(chat_id):
		return UserMessage.query.filter_by(chat_id=chat_id).all()

	@staticmethod
	def get_all_messages():
		return UserMessage.query.all()

	@staticmethod
	def update_message(message_id, data):
		message = UserMessageDAO.get_message_by_id(message_id)
		if not message:
			return None
		data.pop("id", None)
		data.pop("user_id", None)
		data.pop("chat_id", None)
		message.update_from_dict(data)
		return message

	@staticmethod
	def delete_message(message_id):
		message = UserMessageDAO.get_message_by_id(message_id)
		if not message:
			return False
		db.session.delete(message)
		db.session.commit()
		return True
