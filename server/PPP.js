export const PPP = (req, res) => {
    // const {data} = req.body

    try{
        const {data} = req.body
        if(!data){
            return res.status(404).json({mess: 'send data'})
        }
        return res.status(200).json({data: 'succes'})
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({error: 'sever side P'})
    }
}