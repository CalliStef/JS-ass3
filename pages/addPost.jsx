import { useState, useEffect } from 'react'
import NewPostForm from '../components/NewPostForm'

export default function AddPostForm({handleSubmit}){
    
    return(
        <NewPostForm onSubmit={handleSubmit}></NewPostForm>
    )
}