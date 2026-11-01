import datetime
import hashlib
import hmac
import logging

logger = logging.getLogger(__name__)

# Try passlib/bcrypt first; fall back to sha256-hmac for Python 3.14 compatibility
try:
    from passlib.context import CryptContext
    _pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    _USE_PASSLIB = True
    logger.info("[Security] Using passlib/bcrypt for password hashing.")
except Exception as e:
    _USE_PASSLIB = False
    logger.warning(f"[Security] passlib unavailable ({e}), using sha256-hmac fallback.")

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")

def get_password_hash(password: str) -> str:
    # Truncate to 72 bytes as required by standard bcrypt specs
    safe_password = password[:72]
    if _USE_PASSLIB:
        try:
            return _pwd_context.hash(safe_password)
        except Exception:
            pass
    # Secure sha256-hmac fallback
    secret = settings.JWT_SECRET.encode()
    return "sha256:" + hmac.new(secret, safe_password.encode(), hashlib.sha256).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    safe_password = plain_password[:72]
    if hashed_password.startswith("sha256:"):
        secret = settings.JWT_SECRET.encode()
        expected = "sha256:" + hmac.new(secret, safe_password.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, hashed_password)
    if _USE_PASSLIB:
        try:
            return _pwd_context.verify(safe_password, hashed_password)
        except Exception:
            pass
    return False

def create_access_token(data: dict, expires_delta: datetime.timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception

def create_access_token(data: dict, expires_delta: datetime.timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception

