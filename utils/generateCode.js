export const generateCode = (codeLength) => {
    let code = ""
    const number = String(Math.random()).split(".")[1];
    const length = number.length
    
    if(!codeLength){
        codeLength = 4
    }

    for(let i = 0; i < codeLength; i++){
        code = code + number[length -(i + 1)]
    }

    return code
}