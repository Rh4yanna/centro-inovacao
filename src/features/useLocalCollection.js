import { useState } from 'react';
export function useLocalCollection(key, initial) {
  const [items,setItems]=useState(()=>{try {const value=JSON.parse(localStorage.getItem(key)); return Array.isArray(value) && value.every(v=>v && typeof v.id==='string' && typeof v.name==='string') ? value : initial;}catch{return initial;}});
  function save(item) {const next=items.some(v=>v.id===item.id) ? items.map(v=>v.id===item.id ? item : v) : [...items,item]; localStorage.setItem(key,JSON.stringify(next));setItems(next);return true;}
  return [items,save];
}
