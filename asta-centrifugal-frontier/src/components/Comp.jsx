import axios from "axios"
import {useState} from 'react' 

export const Comp = () => {

    const [data, setData] = useState('')

    const ptoB = (e) => {
        e.preventDefault()
        try{
            const d = axios.post('http://localhost/8000', {data: data});
            const res = d.data;
            if(res.status === 200){
                setData(res);
            };
        }
        catch(error){
            console.error(error.message);
        };
    };

    return(<>
    <header><p>hello</p></header>

    <form onSubmit={ptoB}><input type='text' value={data} placeholder="data" onChange={(e) => e.target.value}></input><button type='submit'>post data</button></form>

    <footer>by</footer>
    </>);
};

