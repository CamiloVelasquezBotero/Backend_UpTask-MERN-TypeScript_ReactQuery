// Esta funcion siempre generara un numero de 6 digitos
export const generateToken = () => Math.floor(100000 + Math.random() * 900000).toString() 