from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "hotel-booking-super-secret-key-change-in-production-2026"
ALGORITHM = "HS256"

expire = datetime.utcnow() + timedelta(minutes=1440)
to_encode = {"sub": "1", "exp": expire}
token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
print(token)
