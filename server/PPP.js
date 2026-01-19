export const PPP = () => {
    const {data} = req.body

    try{
        if(!data){
            return res.status(404).json({mess: 'send data'})
        }
        return 
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({error: 'sever side P'})
    }
}