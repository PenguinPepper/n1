import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabase';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> =>{
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({error: 'Unauthorized: no token provided'});
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const {data: {user}, error} = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({error: 'Unauthorized: invalid token'});
            return;
        }

        req.user = {
            id: user.id,
            email: user.email || '',
            aud: user.aud,
            role: user.role
        };
        next();
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}