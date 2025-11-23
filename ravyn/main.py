#!/usr/bin/env python
from pydantic import BaseModel, EmailStr
import uvicorn

from ravyn import Cookie, Gateway, Param, Ravyn, JSONResponse, Request, Response, get, post
import ravyn.core.datastructures as ds
from ravyn.openapi.datastructures import OpenAPIResponse
from ravyn.security.api_key import APIKeyInCookie


@get("/ravyn")
def welcome() -> JSONResponse:
    return JSONResponse({"message": "Welcome to Ravyn"})


@get("/ravyn/{user}")
def user(user: str) -> JSONResponse:
    return JSONResponse({"message": f"Welcome to Ravyn, {user}"})


@get("/ravyn/in-request/{user}")
def user_in_request(request: Request) -> JSONResponse:
    user = request.path_params["user"]
    return JSONResponse({"message": f"Welcome to Ravyn, {user}"})


class RegisterData(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

@post("/auth/register")
def register(data: RegisterData) -> JSONResponse:
    return JSONResponse({"message": "Register endpoint"})


class LoginData(BaseModel):
    email: EmailStr
    password: str


@post("/auth/login")
def login(data: LoginData) -> JSONResponse:
    return JSONResponse({"message": "Login endpoint"})


class UserCreateResponse(BaseModel):
    message: str


@post(
    path="/create",
    response_cookies=[
        ds.Cookie(
            key="csrf",
            value="CIwNZNlR4XbisJF39I8yWnWX9wX4WFoz",
            max_age=3000,
            httponly=True,
        )
    ],
    responses={201: OpenAPIResponse(model=UserCreateResponse, description="User created successfully.")},
    security=[APIKeyInCookie(name="X_COOKIE_API")]
)
async def logout(cookie: str = Cookie(value="X_COOKIE_API")) -> JSONResponse:
    """
    Run validations with the token header
    """
    return JSONResponse(
        content={"message": f"User created successfully. Cookie value: {cookie}"},
        status_code=201,
    )


app = Ravyn(routes=[
    # Gateway("/ravyn", welcome),
    # Gateway("/ravyn/{user}", user),
    # Gateway("/ravyn/in-request/{user}", user_in_request),
    # Gateway("/auth/register", handler=register),
    # Gateway("/auth/login", handler=login),
    Gateway(handler=logout),
])


if __name__ == "__main__":
    uvicorn.run(app, port=8000)