import { CookieOptions } from 'express'

export const getCookieOptions = (maxAge: number): CookieOptions => {
    const isProduction = process.env.NODE_ENV === 'production'

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge,
        // Không set domain trong production để tránh vấn đề cross-domain
        // domain: isProduction ? 'chattr-namdt1610s-projects.vercel.app' : undefined,
    }
}

export const getClearCookieOptions = (): CookieOptions => {
    const isProduction = process.env.NODE_ENV === 'production'

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        // Không set domain trong production để tránh vấn đề cross-domain
        // domain: isProduction ? 'chattr-namdt1610s-projects.vercel.app' : undefined,
    }
}
