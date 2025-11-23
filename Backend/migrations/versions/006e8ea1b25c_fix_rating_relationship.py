from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006e8ea1b25c'
down_revision = '8ce1bdf999ab'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Remover FOREIGN KEY antiga em "chats"
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    # Encontrar o nome da FK que aponta para ratings
    fks = inspector.get_foreign_keys('chats')
    for fk in fks:
        if fk['referred_table'] == 'ratings' and 'rating_id' in fk['constrained_columns']:
            op.drop_constraint(fk['name'], 'chats', type_='foreignkey')

    # 2. Remover índice antigo (se existir)
    indexes = inspector.get_indexes('chats')
    for idx in indexes:
        if idx['column_names'] == ['rating_id']:
            op.drop_index(idx['name'], table_name='chats')

    # 3. Remover coluna rating_id de chats
    with op.batch_alter_table('chats') as batch_op:
        batch_op.drop_column('rating_id')

    # 4. Adicionar chat_id em ratings
    with op.batch_alter_table('ratings') as batch_op:
        batch_op.add_column(sa.Column('chat_id', sa.Integer(), nullable=True))
        batch_op.create_unique_constraint('uq_ratings_chat_id', ['chat_id'])
        batch_op.create_foreign_key('fk_ratings_chat_id', 'chats', ['chat_id'], ['id'])


def downgrade():
    # Reverter tudo se necessário

    with op.batch_alter_table('ratings') as batch_op:
        batch_op.drop_constraint('fk_ratings_chat_id', type_='foreignkey')
        batch_op.drop_constraint('uq_ratings_chat_id', type_='unique')
        batch_op.drop_column('chat_id')

    with op.batch_alter_table('chats') as batch_op:
        batch_op.add_column(sa.Column('rating_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_chats_rating_id', 'ratings', ['rating_id'], ['id'])
        batch_op.create_index('ix_chats_rating_id', ['rating_id'])
