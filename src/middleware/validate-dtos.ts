import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validationMiddleware(type: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dtoObj = plainToInstance(type, req.body);
        const errors = await validate(dtoObj, { whitelist: true, forbidNonWhitelisted: true });

        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.map((e) => e.constraints),
            });
        }
        req.body = dtoObj;
        next();
    };
}
