export const preset = 'ts-jest'
export const testEnvironment = 'node'
export const moduleNameMapper = {
    '^@/(.*)$': '<rootDir>/src/$1', // Đảm bảo alias @ trỏ đúng đến thư mục src
}
