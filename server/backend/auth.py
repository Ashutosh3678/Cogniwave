"""
Authentication utilities for doctor login
JWT tokens and password hashing
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db, Doctor

# Security configuration
SECRET_KEY = "your-secret-key-change-this-in-production-use-env-variable"  # TODO: Use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)

# Token utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# Authentication dependencies
def get_current_doctor(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Doctor:
    """Get current authenticated doctor from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    doctor = db.query(Doctor).filter(Doctor.username == username).first()
    if doctor is None:
        raise credentials_exception
    
    if not doctor.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    return doctor

def authenticate_doctor(db: Session, username: str, password: str) -> Optional[Doctor]:
    """Authenticate doctor with username and password"""
    doctor = db.query(Doctor).filter(Doctor.username == username).first()
    if not doctor:
        return None
    if not verify_password(password, doctor.hashed_password):
        return None
    return doctor
