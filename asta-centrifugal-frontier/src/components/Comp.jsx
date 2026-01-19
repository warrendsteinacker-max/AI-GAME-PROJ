import axios from "axios"
import {useState} from 'react' 

export const Comp = () => {

    const [data, setData] = useState('')

    const ptoB = async(e) => {
        e.preventDefault()
        try{
            const d = await axios.post('http://localhost:8000/pp', {data: data});
            const res = d.data;
            if(d.status === 200){
                setData(res.data);
            };
        }
        catch(error){
            console.error(error.message);
        };
    };

    return(<>
    {/* // <header><p>hello</p></header>

    // <form onSubmit={ptoB}><input type='text' value={data} placeholder="data" onChange={(e) => setData(e.target.value)}></input><button type='submit'>post data</button></form>

    // <footer>by</footer> */}
    <div id="boxxx"></div>
    </>);
};

