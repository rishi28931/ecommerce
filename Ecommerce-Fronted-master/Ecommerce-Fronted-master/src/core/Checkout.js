import React, { useState, useEffect } from "react";
import {getBrainTreeClientToken,processPayment,createOrder} from "./apiCore";
import {isAuthenticated} from '../auth';
import {emptyCart} from './cartHelpers';
import {Link} from 'react-router-dom'
import DropIn from 'braintree-web-drop-in-react';


const Checkout =({products})=>{
    const [data,setData]=useState({
        success:false,
        clientToken:null,
        error:'',
        instance:{},
        address:''
    })

    const userId = isAuthenticated() && isAuthenticated().user._id;
    const token = isAuthenticated() && isAuthenticated().token;

    const getToken=(userId,token)=>{
        getBrainTreeClientToken(userId,token).then(data=>{
            if(data.error){
                setData({...data, error:data.error})
            }else{
                setData({ clientToken:data.clientToken})
            }
        })
    }


    useEffect(()=>{
      getToken(userId,token)
    },[])

    const getTotal =()=>{
        return products.reduce((currentValue,nextValue)=>{
          return currentValue+ nextValue.count*nextValue.price;
        },0)
    }

    const showCheckout =()=>{
        return(
           
            isAuthenticated() ?(
                <div>{showDropIn()}</div>
            ):(
                <Link to="/signin"><button className="btn btn-primary">SignIn to Checkout</button></Link>
            )
        
        )
    }

    const handleAddress =(event)=>{
        setData({...data,address:event.target.value})
    }

    let deliveryAddress = data.address

    const buy=()=>{
        let nonce;
        let getNonce=data.instance.requestPaymentMethod()
        .then(data=>{
            // console.log(data)
            nonce = data.nonce;
            // console.log('send the nonce and total to process', nonce,getTotal(products))
            const paymentData= {
                paymentMethodNonce:nonce,
                amount:getTotal(products)
            }
            processPayment(userId,token,paymentData)
            .then(response=>{
                 
                const createOrderData ={
                    products:products,
                    transaction_id:response.transaction.id,
                    amount: response.transaction.amount,
                    address:deliveryAddress
                }
                createOrder(userId,token,createOrderData)

                setData({...data,success:response.success})
                emptyCart(()=>{
                    console.log("Cart emplteid")
                })
            })
            .catch(error=>console.log(error))
        })
        .catch(error=>{
            // console.log('dropin error: ', error)
            setData({...data,error:error.message})
        })
    }

    const showDropIn=()=>(
        <div onBlur={()=>setData({...data,error:""})}>
            {data.clientToken!== null && products.length>0 ? (
                <div>
                    <div className="form-group mb-3">
                        <label className="text-muted">Delivery Address</label>
                        <textarea
                        onChange={handleAddress}
                        className="form-control"
                        value={data.address}
                        placeholder="Type your Delivery address Here...."
                         />
                    </div>
                    <DropIn options={{
                     authorization: data.clientToken,
                     paypal:{
                       flow:"vault"
                     },
                     googlePay:{
                         flow:"vault"
                     }
                    }} onInstance={instance=> data.instance = instance}/>
                    <button onClick={buy} className="btn btn-success btn-block">Pay</button>
                </div>
            ): null }
        </div>
    )

    const showError = error=>(
      <div className="alert alert-danger" style={{display:error?'':'none'}}>
          {error}
      </div>
    )
    const showSuccess = success=>(
        <div className="alert alert-info" style={{display:success?'':'none'}}>
            Thanks! Your Payment was successfull!
        </div>
      )
    return ( 
        <div>
         <h2>Total : ${getTotal()}</h2>
         {showError(data.error)}
         {showSuccess(data.success)}
         {showCheckout()}
        </div>
    )
}

export default Checkout;




