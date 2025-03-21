import { useState } from "react";

const Counter = () => {
    const [count, setCount] = useState(2);

    const increment = () => setCount(count + 1);
    let value=0
    return (
        <div>
            <h1>Counter: {count}</h1>
            <button onClick={increment}>Increment</button>
            <button onClick={()=>{
                value++
                console.log(value)
            }}>Increment</button>

            <h1>Value: {value}</h1>
         
        </div>
    );
};

export default Counter;
