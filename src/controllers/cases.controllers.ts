import type { Request, Response } from 'express';
import { pool } from '../config/database.js';


export interface AuthRequest extends Request {
    user?: {
        id: string; 
        [key: string]: any; 
    };
}


export const createCase = async (req: AuthRequest, res: Response) => {
    try {
        const {title, description} = req.body;
        const ownerId = req.user?.id;

        const query = `
        INSERT INTO public.cases (title, description, owner_id)
        VALUES ($1, $2, $3)
        RETURNING *;
        
    `;  

    const result = await pool.query(query, [title, description, ownerId]);
    res.status(201).json({
        message: 'Caso creado exitosamente',
        data: result.rows[0],
    });
    }catch (error) {
        console.error('Error al crear el caso:', error);
        res.status(500).json({
            message: 'Error interno del servidor al crear el caso',
        });
    }
}


export const getCases = async (req: AuthRequest, res: Response) => {
    try {
        const userID = req.user?.id;

        const query = `
        SELECT DISTINCT c.*
        FROM public.cases c
        -- 4. Corregido el nombre de la tabla (era case_collaborators, no cases.collaborators)
        LEFT JOIN public.case_collaborators cc ON c.id = cc.case_id 
        WHERE c.owner_id = $1 OR cc.user_id = $1;
    `;

    const result = await pool.query (query, [userID]);
    res.status(200).json(result.rows);
    }catch (error) {
        console.error('Error al obtener los casos:', error);
        res.status(500).json({ mesagge: 'Error interno del servidor al obtener los casos' });
    }
}