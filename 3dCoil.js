var coilWidth=5;
var coilRadius=30;

var E=[];
var B=[];//magnetic field
var B1=[];//magnetic field
var dBdt=[];
var j=[];//current density
var rotj=[];//rot of current density
var zsqr=[];//impedance squared
var iperm=[];//1/permittivity
var w=128;
var h=128;

var dx=0.001;//in meter
var z_v= 376.730313668;//impedance of vaccum(ohm)
var perm_v=(8.8541878128*Math.pow(10,-12));
var c=299792458;//m/s
var idx=1/dx;
var dt=0.7*dx/c;//1/(c*0.15*idx);//in second  <1/ c/sqrt2　(1/dx)
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
    for(var y=0;y<w;y++){
        E[x].push([]);
        B[x].push([]);
        B1[x].push([]);
        dBdt[x].push([]);
        j[x].push([]);
        rotj[x].push([]);
        iperm[x].push([]);
        zsqr[x].push([]);
        for(var z=0;z<h;z++){
            B[x][y].push({x:0,y:0,z:0});
            B1[x][y].push({x:0,y:0,z:0});
            dBdt[x][y].push({x:0,y:0,z:0});
            E[x][y].push({x:0,y:0});
            j[x][y].push({x:0,y:0});
            rotj[x][y].push({x:0,y:0,z:0});
            iperm[x][y].push(1/perm_v);
            zsqr[x][y].push(z_v*z_v);
        }
    }
}
var coilPos=Math.floor(h/2);
for(var r=coilRadius-coilWidth/2;r<=coilRadius+coilWidth/2;r+=0.1){
    for(var theta=0;theta<2*Math.PI;theta+=0.05){
        var x=Math.cos(theta);
        var y=Math.sin(theta);
        var x1=x*r+w/2;
        var y1=y*r+w/2;
        x1=Math.round(x1);
        y1=Math.round(y1);
        j[x1][y1][coilPos]={x:-y/coilWidth,y:x/coilWidth};
    }
} 
for(var x=0;x<w-1;x++){
    for(var y=0;y<h-1;y++){
        rotj[x][y][coilPos].z=
            (j[x+1][y][coilPos].y-j[x][y][coilPos].y)*idx
            -(j[x][y+1][coilPos].x-j[x][y][coilPos].x)*idx;
    }
}
/*
console.log("aaa");
console.log(dBdt);
console.log(B);
*/
var t=0;
function simulate(){
    var dti=1/dt;
    var sin=Math.sin(t*0.5*c/dx);
    //B[64][64].z=sin;
    sin=1;
    t+=dt;
    var csqr=c*c;
    for(var x=1;x<w-1;x++){
        for(var y=1;y<w-1;y++){
            for(var z=coilPos-1;z<=coilPos+1;z++){
                dBdt[x][y][z].z+=iperm[x][y][z]*sin*rotj[x][y][z].z;
            }
        }
    }
    for(var x=1;x<w-1;x++){
        for(var y=1;y<w-1;y++){
            for(var z=1;z<h-1;z++){
                let laplacianBz=
                    (B1[x][y+1][z].z+B1[x][y-1][z].z+ B1[x+1][y][z].z+B1[x-1][y][z].z-4*B1[x][y][z].z)*idx*idx;
                dBdt[x][y][z].z+=laplacianBz*csqr*dt;
                //dBdt[x][y].z+=(-zsqr[x][y]*rotj[x][y].z-
                //               iperm[x][y]*sin*laplacianBz)*dt;

                //dBdt[x][y].x+=(-zsqr[x][y]*rotj[x][y].x-iperm[x][y]*rotbx)*dt;

                //dBdt[x][y].y+=(-zsqr[x][y]*rotj[x][y].y-iperm[x][y]*rotby)*dt;
            }

        }
    }
    for(var z=0;z<h;z++){
        for(var x=0;x<w;x++){
            for(var y=0;y<w;y++){
                //B[x][y].x+=dBdt[x][y].x*dt;
                //B[x][y].y+=dBdt[x][y].y*dt;
                B[x][y][z].z=B1[x][y][z].z+dBdt[x][y][z].z*dt;
            }
        }
    }
    var us=c*dt*idx;
    var coefficient=(us-1)/(us+1);
    var coefficient2=(2+us*us*dx*dx/2)/(us+1);
    //abosorbing boundary
    for(var z=1;z<h-1;z++){
        for(var x=1;x<w-1;x++){
            B[x][0][z].z=B[x][1][z].z
                +coefficient*(B[x][1][z].z-B1[x][0][z].z);
            B[x][w-1][z].z=B[x][w-2][z].z
                +coefficient*(B[x][w-2][z].z-B1[x][w-1][z].z);
        }
    }

    for(var z=1;z<h-1;z++){
        for(var y=1;y<h-1;y++){
            B[0][y][z].z=B[1][y][z].z
                +coefficient*(B[1][y][z].z-B1[0][y][z].z);
            B[w-1][y][z].z=B[w-2][y][z].z
                +coefficient*(B[w-2][y][z].z-B1[w-1][y][z].z);
        }
    }
    var tmp=B;
    B=B1;
    B1=tmp;
}


var bplot=new ScalerPlot();
bplot.setSize(w*10,h*10);
bplot.setDotSize(1/dx);
//setInterval(timer,100);
//timer();
var start=new Date().getTime();
for(var i=0;i<10;i++){
    simulate();
}
var end=new Date().getTime();
console.log(`simuation time:${end-start}ms`)
var max=0;
/*
for(var x=0;x<w;x++){
    for(var y=0;y<w;y++){
        max=Math.max(Math.abs(B[x][y][coilPos].z),max);
        if(B[x][y][coilPos].z!=0){
            console.log([x,y]);
        }
        //bplot.addPoint(x*10,y*10,B[x][y][coilPos].z);
        //bplot.addPoint(x*10,y*10,1);
    }
}*/
var xzplane=Math.floor(w/2);
for(var x=0;x<w;x++){
    for(var z=0;z<h;z++){
        var b=B[x][xzplane][z].z;
        max=Math.max(Math.abs(b),max);
        bplot.addPoint(x*10,z*10,b);
        //bplot.addPoint(x*10,y*10,1);
    }
}
console.log(B[64][64][coilPos]);
console.log(max);
bplot.setDotSize(10/max);
bplot.draw();
/*
function timer(){
}*/
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