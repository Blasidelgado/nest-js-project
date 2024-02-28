import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
    signup(){
        return {message: 'signing up'};
    }

    signin() {
        return 'I am signing in'
    }
}