const startIntegral=400;
const steps=500;
function experiment(d,r,ww,iscoin){
    var coilWidth=ww;
    var coilRadius=r;
    var coilHeight=3;


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

    const coinRadius=iscoin?10:0;//10mm
    const coinPos=h/2+d;
    const coinHeight=1;//3mm

    const metalMu=1.256665*Math.pow(10,-6);
    const metaliPerm=1/(perm_v*0.999991);//copper
    const metalConductance=5.76*Math.pow(10,7);//copper S/m
    const metalCoefficient=metaliPerm*metalConductance;
    console.log(metalCoefficient);

    //console.log(1/metalCoefficient);

    var idx=1/dx;
    var dt=0.7*dx/c;//1/(c*0.15*idx);//in second  <1/ c/sqrt2　(1/dx)
    console.log(`dt:${dt}`);//1Thz
    var startinit=new Date().getTime();
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
    console.log(-startinit+new Date().getTime());
    console.log("init time");
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
        const idxsqr=idx*idx;
        const laplaciancoefficient=idx*idx*csqr*dt;
        for(var x=1;x<w-1;x++){
            for(var y=1;y<h-1;y++){
                const laplacianBz=
                      (B1[x][y+1].z+B1[x][y-1].z+ B1[x+1][y].z+B1[x-1][y].z-4*B1[x][y].z);
                //dBdt[x][y].z+=laplacianBz*csqr*dt+iperm[x][y]*sin*rotj[x][y].z;
                /*
            if(coinPos<=y&&y<coinPos+coinHeight&&x<=coinRadius){
                csqr1/=5000*5000;
            }*/
                dBdt[x][y].z+=laplacianBz*laplaciancoefficient;
                const laplacianBr=
                      (B1[x+1][y].r+B1[x-1][y].r+B1[x][y+1].r+B1[x][y-1].r
                       -4*B1[x][y].r-B1[x][y].r/(x*x));
                dBdt[x][y].r+=laplacianBr*laplaciancoefficient;
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
            for(var y=coinPos;y<coinPos+coinHeight;y++){
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
        if(count>startIntegral){
            avgInductance+=-(voltage/(i_0*omega*Math.cos(omegat)));
        }
    }



    //var bzplot=new ScalerPlot();
    //bzplot.setSize(w*10,h*10);

    for(var i=0;i<steps;i++){
        simulate();
    }
    return avgInductance/(count-startIntegral);

    var div=document.createElement("div");
    div.style.float="left";
    document.body.appendChild(div);
    var br=document.createElement("br");
    document.body.appendChild(br);
    var label=document.createElement("h2");
    label.innerHTML="condition:d="+d+" r="+r+" w="+ww;
    div.appendChild(label);
    var itag=document.createElement("p");
    div.appendChild(itag);

    var bplot=new FieldPlot(div);
    bplot.setSize(w*10,h*10);
    bplot.setArrowSize(1/dx);

    console.log(avgInductance/count-startIntegral);
    itag.innerHTML="inductance:"+(avgInductance/(count-1000));
    let max=0;
    for(var x=0;x<w;x+=4){
        for(var y=0;y<h;y+=4){
            var val=B[x][y];
            var norm=val.z*val.z+val.r*val.r;
            norm=Math.sqrt(norm);
            max=Math.max(norm,max);
            bplot.addPoint(x*10,y*10,-val.r,val.z);
            /*if(norm!=0)
                bplot.addPoint(x*10,y*10,-val.r/norm,val.z/norm);*/
        }
    }
    console.log(max);
    bplot.setDotSize(2);
    bplot.setDotColor("#eee");
    //bplot.setArrowSize(10);
    bplot.setArrowSize(300/max);
    //bplot.setArrowSize(10);
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
    return avgInductance/(count-500);
}
//draw
/*
experiment(10,30,10,true);
experiment(10,30,10,false);*/
var latex_table="\\hline\n";

latex_table +="コインの距離 ";

latex_table +="& \n";
latex_table +="コインなし&";
for(var j=0;j<10;j++){
    var d=Math.floor(j*j)+5;//j*j*j/4
    latex_table +=d;
    if(j<9)
        latex_table +="&";

}
latex_table +="\\\\ \n";
latex_table+="/ コイルの半径";
for(var j=0;j<=10;j++){
    latex_table +="&";
}
latex_table +="\\\\ \n";

var start=new Date().getTime();
for(var i=1;i<=1;i++){
    var r=i*i;
    r=4;
    latex_table +="\\hline\n";
    latex_table +=r;
    latex_table +="&";
    var num=experiment(0,r,1,false)*1000*1000;
    var numstr=num.toString();
    if(num<1000){
        numstr=numstr.substr(0,5);
    }else{
        var n1="";
        for(var i=0;i<numstr.length;i++){
            n1+=numstr[i];
            if(numstr[i]==".")break;
        }
        numstr=n1;
    }
    latex_table +=numstr;
    latex_table +="&";
    for(var j=0;j<10;j++){
        var d=j;
        var num=experiment(d,r,1,true)*1000*1000;
        var numstr=num.toString();
        if(num<1000){
            numstr=numstr.substr(0,5);
        }else{
            var n1="";
            for(var i=0;i<numstr.length;i++){
                n1+=numstr[i];
                if(numstr[i]==".")break;
            }
            numstr=n1;
        }
        latex_table +=numstr;
        if(j<9)
            latex_table +="&";
    }
    
    alert(i);

    latex_table +="\\\\\n";
}
latex_table +="\\hline\n";
var textbox=document.createElement("textarea");
textbox.cols=40;
textbox.rows=30;
textbox.value=latex_table;
document.body.appendChild(textbox);