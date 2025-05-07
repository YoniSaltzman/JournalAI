from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from models import User
from database import get_db
from auth import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get('sub')

        if user_id is None:
            print('token missing "sub"')
            raise HTTPException(status_code=401, detail='Invalid token')
        
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise HTTPException(status_code=401, detail='User with id {user_id} not found')

        return user
    except JWTError as e:
        print('JWTError:', str(e))
        raise HTTPException(status_code=401, detail='Invalid Credentials')