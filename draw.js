
class FieldPlot{
    constructor(){
        this.canvas=document.createElement("canvas");
        this.ctx=this.canvas.getContext("2d");
        this.setSize(500,500);
        this.setArrowSize(10);
        this.setDotColor("#eee");
        this.data={};
        this.setColorFlip(false);
        document.body.appendChild(this.canvas);
    }
    setSize(x,y){
        this.w=x;
        this.h=y;
        this.canvas.width=x;
        this.canvas.height=y;
    }
    setArrowSize(l){
        this.l=l;
    }

    addPoint(x,y,u,v){
        this.data[JSON.stringify([x,y])]=[u,v];
    }
    flush(){
        this.data={};
    }
    setDotSize(d){
        this.dotSize=d;
    }
    setDotColor(d){
        this.dotColor=d;
    }
    setColorFlip(flip){
        this.flip=flip;
    }
    draw(){
        let ctx=this.ctx;
        ctx.clearRect(0,0,this.w,this.h);
        ctx.fillStyle=this.dotColor;
        for(var c in this.data){
            var c1=JSON.parse(c);
            ctx.fillRect(c1[0]-this.dotSize,c1[1]-this.dotSize,this.dotSize*2,this.dotSize*2);
            let d=this.data[c];
            ctx.beginPath();
            ctx.moveTo(c1[0],c1[1]);
            ctx.lineTo(c1[0]+d[0]*this.l,c1[1]+d[1]*this.l);
            ctx.closePath();
            if(this.setColorFlip){
                ctx.strokeStyle=d[1]>0?"#f00":"#00f";
            }
            ctx.stroke();
        } 
    }
}


class ScalerPlot{
    constructor(){
        this.canvas=document.createElement("canvas");
        this.ctx=this.canvas.getContext("2d");
        this.setSize(500,500);
        this.data={};
        document.body.appendChild(this.canvas);
        this.setNegativeColor("#00f");
        this.setPositiveColor("#f00");
        this.setDotSize(10);
    }
    setSize(x,y){
        this.w=x;
        this.h=y;
        this.canvas.width=x;
        this.canvas.height=y;
    }
    addPoint(x,y,f){
        this.data[JSON.stringify([x,y])]=f;
    }
    flush(){
        this.data={};
    }
    setDotSize(d){
        this.dotSize=d;
    }
    setPositiveColor(d){
        this.posColor=d;
    }
    setNegativeColor(d){
        this.negColor=d;
    }
    draw(){
        let ctx=this.ctx;
        ctx.clearRect(0,0,this.w,this.h);
        for(var c in this.data){
            var c1=JSON.parse(c);
            let d=this.data[c];
            var size=this.dotSize*d;
            ctx.fillStyle=size>0?this.posColor:this.negColor;
            size=Math.abs(size);
            ctx.fillRect(c1[0]-size,c1[1]-size,size*2,size*2);
        } 
    }
}
/*
testCode();
function testCode(){
    var plot=new FieldPlot();
    for(var i=0;i<20;i++){
        for(var j=0;j<20;j++){
            plot.addPoint(i*30,j*30,-j,i);
        }
    }
    plot.draw();
}*/