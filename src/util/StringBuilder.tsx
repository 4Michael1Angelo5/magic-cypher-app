class StringBuilder{
    textArray:Array<string>;
    constructor(){
      this.textArray = [];
    }
    
    append = (char:string):void=>{
      this.textArray.push(char);
    }
  
    toString =():string=>{
      return this.textArray.join("");
    }

    size =():number=> {
      return this.textArray.length;
    }
  
  }

  export default StringBuilder;