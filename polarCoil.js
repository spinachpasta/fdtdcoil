
var coilWidth=1;
var coilRadius=30;
var coilHeight=1;


var E=[];
var B=[];//magnetic field
var B1=[];//magnetic field
var dBdt=[];
var j=[];//current density
var rotj=[];//rot of current density
var zsqr=[];//impedance squared
var iperm=[];//1/permittivity
var w=128;//radius
var h=256;//height
var dx=0.001;//in meter
var z_v= 376.730313668;//impedance of vaccum(ohm)
var perm_v=(8.8541878128*Math.pow(10,-12));
var c=299792458;//m/s

const coinRadius=10;//10mm
const coinPos=h/2+100;
const coinHeight=2;//3mm

const metalMu=1.256665*Math.pow(10,-6);
const metaliPerm=1/(perm_v*0.999991);//copper
const metalConductance=5.76*Math.pow(10,7);//copper S/m
const metalCoefficient=metaliPerm*metalConductance;
console.log(metalCoefficient);

//console.log(1/metalCoefficient);

var idx=1/dx;
var dt=0.7*dx/c;//1/(c*0.15*idx);//in second  <1/ c/sqrt2　(1/dx)
console.log(`dt:${dt}`);//1Thz

var conductivity=5.96*Math.pow(10,7)//copper:5.96×10^7	S/m
//console.log(j.push);
for(var x=0;x<w;x++){
    E.push([]);
    B.push([]);
    B1.push([]);
    dBdt.push([]);
    j.push([]);
    rotj.push([]);
    iperm.push([]);
    zsqr.push([]);
    for(var y=0;y<h;y++){
        B[x].push({r:0,phi:0,z:0});
        B1[x].push({r:0,phi:0,z:0});
        dBdt[x].push({r:0,phi:0,z:0});
        E[x].push({x:0,y:0});
        j[x].push({r:0,phi:0,z:0});
        rotj[x].push({r:0,phi:0,z:0});
        iperm[x].push(1/perm_v);
        zsqr[x].push(z_v*z_v);
    }
}
for(var y=h/2-coilHeight;y<=h/2+coilHeight;y++){
    for(var r=coilRadius-coilWidth/2;r<=coilRadius+coilWidth/2;r+=0.1){
        j[Math.floor(r)][y]={r:0,phi:1,z:0};
    } 
}

for(var x=0;x<=coinRadius;x++){
    for(var y=coinPos-coinHeight/2;y<=coinPos+coinHeight/2;y++){
        iperm[x][y]=metaliPerm;
    }
}
for(var r=0;r<w-1;r++){
    for(var y=h/2-coilHeight-3;y<=h/2+coilHeight+3;y++){
        rotj[r][y].r=-(j[r][y+1].phi-j[r][y].phi)*idx;
        if(r!=0)
            rotj[r][y].z=-((r+1)*j[r+1][y].phi-r*j[r][y].phi)/r*idx;
    }
}
console.log("aaa");
console.log(dBdt);
console.log(B);
var t=0;
console.log(dt*metalCoefficient);
let avgInductance=0;
let count=0;
let loopcount=0;
function simulate(){
    loopcount++;
    var dti=1/dt;
    const omega=Math.pow(10,5);//0.5*c/dx;
    const omegat=t*omega;//t*0.5*c/dx;
    var sin=Math.sin(omegat);
    //sin=Math.sin(t*Math.pow(10,9));
    //B[64][64].z=sin;
    //sin=1;
    t+=dt;
    var csqr=c*c;
    for(var y=h/2-coilHeight-1;y<=h/2+coilHeight+1;y++){
        for(var x=0;x<w;x++){
            dBdt[x][y].z+=iperm[x][y]*rotj[x][y].z*sin*dt;
            dBdt[x][y].r+=iperm[x][y]*rotj[x][y].r*sin*dt;
        }
    }

    for(var x=1;x<w-1;x++){
        for(var y=1;y<h-1;y++){
            let laplacianBz=
                (B1[x][y+1].z+B1[x][y-1].z+ B1[x+1][y].z+B1[x-1][y].z-4*B1[x][y].z)*idx*idx;
            //dBdt[x][y].z+=laplacianBz*csqr*dt+iperm[x][y]*sin*rotj[x][y].z;
            var csqr1=csqr;
            /*
            if(coinPos<=y&&y<coinPos+coinHeight&&x<=coinRadius){
                csqr1/=5000*5000;
            }*/
            dBdt[x][y].z+=laplacianBz*csqr1*dt;
            let laplacianBr=
                (B1[x+1][y].r+B1[x-1][y].r+B1[x][y+1].r+B1[x][y-1].r
                 -4*B1[x][y].r-B1[x][y].r/(x*x))*idx*idx;
            dBdt[x][y].r+=laplacianBr*csqr1*dt;
            //dBdt[x][y].z+=(-zsqr[x][y]*rotj[x][y].z-
            //               iperm[x][y]*sin*laplacianBz)*dt;

            //dBdt[x][y].x+=(-zsqr[x][y]*rotj[x][y].x-iperm[x][y]*rotbx)*dt;

            //dBdt[x][y].y+=(-zsqr[x][y]*rotj[x][y].y-iperm[x][y]*rotby)*dt;
        }
    }
    //console.log(metalCoefficient);
    
    //const extinction=Math.exp(-csqr*45*dt);
    //console.log(extinction);
    //coinboundary
    /*
    for(var x=0;x<=coinRadius;x++){
        for(var y=coinPos;y<=coinPos+coinHeight;y++){
            dBdt[x][y].z+=-dBdt[x][y].z*dt*metalCoefficient;
            dBdt[x][y].r+=-dBdt[x][y].r*dt*metalCoefficient;
        }
    }*/
    for(var x=0;x<=coinRadius;x++){
        for(var y=coinPos;y<=coinPos+coinHeight;y++){
            dBdt[x][y].z=0;
            dBdt[x][y].r=0;
        }
    }
    for(var x=0;x<w;x++){
        for(var y=0;y<h;y++){
            //B[x][y　].x+=dBdt[x][y].x*dt;
            //B[x][y].y+=dBdt[x][y].y*dt;
            B[x][y].z=B1[x][y].z+dBdt[x][y].z*dt;
            B[x][y].r=B1[x][y].r+dBdt[x][y].r*dt;
        }
    }
    var us=c*dt*idx;
    var coefficient=(us-1)/(us+1);
    //var coefficient2=(2+us*us*dx*dx/2)/(us+1);
    //abosorbing boundary
    for(var x=1;x<w-1;x++){
        B[x][0].z=B[x][1].z+coefficient*(B[x][1].z-B1[x][0].z);
        B[x][0].r=B[x][1].r+coefficient*(B[x][1].r-B1[x][0].r);
        B[x][h-1].z=B[x][h-2].z+coefficient*(B[x][h-2].z-B1[x][h-1].z);
        B[x][h-1].r=B[x][h-2].r+coefficient*(B[x][h-2].r-B1[x][h-1].r);
    }
    for(var y=1;y<h-1;y++){
        //B[0][y].z=B[1][y].z;
        B[0][y].r=B[1][y].r;//+coefficient*(B[1][y].z-B1[0][y].z);
        B[w-1][y].z=B[w-2][y].z+coefficient*(B[w-2][y].z-B1[w-1][y].z);
        B[w-1][y].r=B[w-2][y].r+coefficient*(B[w-2][y].r-B1[w-1][y].r);
    }

    var tmp=B;
    B=B1;
    B1=tmp;
    var voltage=0;
    count++;
    //calculate voltage
    for(var r=0;r<=coilRadius-coilWidth;r++){
        voltage+=dBdt[r][h/2].z*r*dx;
    }
    voltage*=2*Math.PI;
    var i_0=coilWidth*dx*coilHeight*dx;
    //console.log(i_0);
    //console.log(`${voltage}V`);
    let inductance=
    avgInductance+=-(voltage/(i_0*omega*Math.cos(omegat)));
}


var bplot=new FieldPlot();
bplot.setSize(w*10,h*10);
bplot.setArrowSize(1/dx);
setInterval(timer,10);

var bzplot=new ScalerPlot();
bzplot.setSize(w*10,h*10);

//timer();
/*
{
    var jplot=new FieldPlot();
    var max=0;
    jplot.setSize(w*10,h*10);
    jplot.setArrowSize(100*dx);
    jplot.setDotSize(2);
    jplot.setDotColor("#eee");
    for(var x=0;x<w;x++){
        for(var y=0;y<h;y++){
            var val=rotj[x][y];
            max=Math.max(Math.sqrt(val.z*val.z+val.r*val.r),max);
            //console.log(val);
            if(val.z>0){
                console.log([x,y]);
            }
            jplot.addPoint(x*10,y*10,val.r,val.z);
        }
    }
    console.log(max);
    jplot.setArrowSize(10/max);
    jplot.draw();
}*/
function timer(){
    //count=0;
    //avgInductance=0;
    for(var i=0;i<100;i++){
        simulate();
    }
    console.log(avgInductance/count);

    let max=0;
    for(var x=0;x<w;x++){
        for(var y=0;y<h;y++){
            var val=B[x][y];
            var norm=val.z*val.z+val.r*val.r;
            norm=Math.sqrt(norm);
            max=Math.max(norm,max);
            //bplot.addPoint(x*10,y*10,-val.r,val.z);
            if(norm!=0)
                bplot.addPoint(x*10,y*10,-val.r/norm,val.z/norm);
        }
    }
    console.log(max);
    bplot.setDotSize(2);
    bplot.setDotColor("#eee");
    bplot.setArrowSize(10);
    //bplot.setArrowSize(100/max);
    bplot.setArrowSize(10);
    bplot.setColorFlip(true);
    bplot.draw();
    var integral=0;
    for(var x=0;x<w;x++){
        integral+=-B[x][0].z;
        integral+=B[x][h-1].z;
    }
    for(var y=0;y<h;y++){
        integral+=B[w-1][0].r;
    }
    //console.log(`integral${integral}`);
    /*
    var max=0;
    for(var x=0;x<w;x++){
        for(var y=0;y<h;y++){
            max=Math.max(Math.abs(B[x][y].z),max);
            bzplot.addPoint(x*10,y*10,B[x][y].z);
        }
    }
    //console.log(B[64][64]);
    console.log(max);
    bzplot.setDotSize(10/max);
    bzplot.draw();
    */
}
/*
var plot=new FieldPlot();
plot.setSize(w*10,h*10);
plot.setArrowSize(100*dx);
plot.setDotSize(2);
plot.setDotColor("#eee");
for(var x=0;x<w;x++){
    for(var y=0;y<h;y++){
        plot.addPoint(x*10,y*10,rotj[x][y].z,0);
    }
}
plot.draw();
*/