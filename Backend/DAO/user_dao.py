from models.user import User
from extensions import db

class UserDAO:
	@staticmethod
	def create_user(name, email, password, extra_data=None):
		user = User(name=name, email=email, password=password, extra_data=extra_data)

		#check if user email is already in use
		if UserDAO.get_user_by_email(email):
			return None

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
	def get_all_admins():
		return User.query.filter_by(is_admin=True).all()
	
	@staticmethod
	def is_user_admin(user_id):
		user = User.query.get(user_id)
		return user.is_admin if user else False

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
