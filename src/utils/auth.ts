import bcrypt from 'bcrypt'

export const hashPassword = async (password:string) => {
    // Hasheo del Password
    const salt = await bcrypt.genSalt(10) /* Generamos la cantidad de (Salt) para hashear este password */
    return await bcrypt.hash(password, salt) /* Gneramos el hasheo, pasandole el password y el salt generado */
}

export const checkPassword = async (password:string, storedHash:string) => {
    return await bcrypt.compare(password, storedHash)   // Comparamos el password con el hasheado en la db eto retorna tru o false
}