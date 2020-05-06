import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { getCart } from "./cartHelpers";
import {Link} from 'react-router-dom';
import Card from "./Card";
import Checkout from './Checkout';


const Cart =()=>{
    const [items,setItem]= useState([]);

    useEffect(()=>{
        setItem(getCart())
    },[items])

    const showItems = items=>{
        return(
            <div>
                <h2>Your cart has {`${items.length}`} items</h2>
                <hr/>
                {items.map((product,i)=>(<Card key={i} 
                  product={product} 
                  showRemoveProductButton={true}
                  showAddToCartButton={false}
                  cartUpdate={true}/>))}
            </div>
        )
    }

    const noItemMessage =()=>(
        <h2>Your cart is empty <br/> <Link to="/shop">Continue Shopping</Link> </h2>
    )

    return (
        <Layout
            title="Cart Page"
            description="Manage your cart Add delete you product "
            className="container-fluid"
        >
            <div className="row">
                <div className="col-6">
                    {items.length>0? showItems(items):noItemMessage()}
                </div>
                <div className="col-6">
                    <h2 className="mb-4">
                        Your Cart Summary
                    </h2>
                    <div><Checkout products={items}/></div>
                </div>
            </div>
            
        </Layout>
    );
}

export default Cart;