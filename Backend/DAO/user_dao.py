from models.user import User
from config import db

class UserDAO:
	@staticmethod
	def create_user(name, email, password, extra_data=None):
		user = User(name=name, email=email, password=password, extra_data=extra_data)
		db.session.add(user)
		db.session.commit()
		return user

	@staticmethod
	def get_user_by_id(user_id):
		return User.query.get(user_id)

	@staticmethod
	def get_user_by_email(email):
		return User.query.filter_by(email=email).first()

	@staticmethod
	def get_all_users():
		return User.query.all()

	@staticmethod
	def update_user(user_id, data):
		user = UserDAO.get_user_by_id(user_id)
		if not user:
			return None
		data.pop("id", None)
		user.update_from_dict(data)
		return user

	@staticmethod
	def delete_user(user_id):
		user = UserDAO.get_user_by_id(user_id)
		if not user:
			return False
		db.session.delete(user)
		db.session.commit()
		return True
