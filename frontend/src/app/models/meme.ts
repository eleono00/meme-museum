export interface Meme {
  id: number;
  title: string;
  imagePath: string; 
  
  Likes?: any[];    
  Dislikes?: any[]; 
  Tags?: any[];   
  
  userId?: number;
  
  createdAt?: string;
  updatedAt?: string;
}