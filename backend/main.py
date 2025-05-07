import auth
import os
from database import SessionLocal, engine, get_db
import datetime
from dependencies import get_current_user
from models import Base, User, JournalEntry, UserSettings
from dotenv import load_dotenv
from openai import OpenAI
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from password_validation import validate_password_strength
import re
from utils import extract_keywords, score_memories, summarize_memories
from schemas import JournalEntryCreate, JournalEntryOut, UserCreate, UserOut, Token, UserSettingsSchema
from sqlalchemy.orm import Session
from typing import List

load_dotenv()

app = FastAPI()

origins = [
    'http://localhost:3000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

Base.metadata.create_all(bind=engine)

@app.post('/register')
def register(user: UserCreate, db: Session = Depends(get_db)):

    is_valid, message = validate_password_strength(user.password)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=message
        )
    # check if user exists
    user_in_db = db.query(User).filter(User.username == user.username).first()
    if user_in_db:
        raise HTTPException(status_code=400, detail='Username already exists')
    
    hashed_pw = auth.hash_password(user.password)       

    new_user = User(username=user.username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_user_settings = UserSettings(user_id=new_user.id)
    db.add(new_user_settings)
    db.commit()
    # create token immediately after registering
    token = auth.create_access_token(new_user)
    return {'access_token': token, 'token_type': 'bearer'}

@app.post('/login', response_model=Token)
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail='Invalid username or password')
    token = auth.create_access_token(db_user)
    return {'access_token': token, 'token_type': 'bearer'}


@app.post('/summarize')
def summarize(journal: JournalEntryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if user_settings:
        if user_settings.memories:
            user_memories = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.date_created.desc()).all()

            if user_memories:
                current_keywords = extract_keywords(journal.entry)
                top_3_memories = score_memories(user_memories, current_keywords)[:3]

                memory_summaries = summarize_memories(top_3_memories)
                formatted_memories = '\n'.join([f'- {mem}' for mem in memory_summaries])

            else: formatted_memories = 'user has no memories currently'
        else: formatted_memories = 'user has no memories currently'
    client = OpenAI(
        api_key=os.environ.get("OPENAI_API_KEY"),
        )

    response = client.responses.create(
        model='gpt-4o',
        instructions= f'''you are a journal entry summarizer. summarize this
        journal entry with a short paragraph and then provide details about the mood and overall emotional
        well being of the writer based on the journal entry. then give the user a litness score based on how lit their day was
        rated 1 through 10. Then, give an emoji that best describes either the mood of the user or something
        related to the user's day.
        include metrics that are formatted in bullet points as such: (make sure to actually write out feeling:, litness score:, and emoji:)
        - feeling:
        - litness score: (make sure to have it written as litness score/10)
        - emoji: (put the emoji here).
        Here are details about the user: name: {user_settings.name}, age: {str(user_settings.age)}.
        If the user asks questions about their own details, answer them.  
        please write in a {user_settings.style} style.
        refer to the user as {user_settings.name}, and write the entry in accordance with the age ({str(user_settings.age)})
        of the user. if the user is old, write like you are writing to an old person, and if young, to a young person.

        Here are some user written details about themselves in a sentence or two: {user_settings.about_me}
        Here are memories from the user, use them to better understand the user and provide better summaries.
        However, if these memories are not related at all to the current entry, then don't mention them.

        {formatted_memories}
        ''',
        input=journal.entry,
    )

    cleaned_summary = re.sub(r'\*\*(.*?)\*\*', '', response.output_text)
    return {'returnedSummary': cleaned_summary}

@app.get('/getsaved', response_model=List[JournalEntryOut])
def get_entries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    saved_entries = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).all()
    return saved_entries

@app.post('/save')
def save_entry(entry: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not entry.get('entry') or not entry.get('summary'):
        raise HTTPException(status_code=400, detail='Entry and summary are required fields')
    new_entry = JournalEntry(
    entry=entry['entry'],
    summary=entry['summary'], 
    user_id=current_user.id
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry) # research what refresh does
    return new_entry

'''whats actually different between the delete method and the get method'''
@app.delete('/deletesaved/{entry_id}')
def delete_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # research why i am filtering for both the journal id and the user id (seems extra since journal id is unique)
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail='Entry not found')
    
    db.delete(entry)
    db.commit()
    return {'detail': 'Entry deleted successfully'}



# make this schema
@app.get('/settings', response_model=UserSettingsSchema)
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if settings:
        return settings
    return JSONResponse(status_code=204, content=None)


@app.post('/settings')
def save_settings(settings: UserSettingsSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings_update = UserSettings(
        name=settings.name,
        age=settings.age,
        style=settings.style,
        memories=settings.memories,
        about_me=settings.about_me,
        user_id=current_user.id
    )
    db.add(settings_update)
    db.commit()
    db.refresh(settings_update)
    return settings_update

@app.put('/settings')
def update_settings(
    settings_update: UserSettingsSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not user_settings:
        raise HTTPException(status_code=404, detail="settings not found")
    
    # research this line but it seems like its iterating over the data from pydantic model
    # but look at the specific syntax like exclude_unset and .items
    for field, value in settings_update.dict(exclude_unset=True).items():
        setattr(user_settings, field, value)

    db.commit()
    db.refresh(user_settings)

    return user_settings


if __name__=='__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)