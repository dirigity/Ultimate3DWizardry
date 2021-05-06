#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_WdepthTexture;


const float resX=600.;
const float resY=resX/2.;
const float bandW=51.;// odd nums only
const float bandWPropotion=bandW/resX;

vec2 fade(vec2 t){return t*t*t*(t*(t*6.-15.)+10.);}
vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}

float cnoise(vec2 P,float seed){
    P+=seed;
    vec4 Pi=floor(P.xyxy)+vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf=fract(P.xyxy)-vec4(0.,0.,1.,1.);
    Pi=mod(Pi,289.);// To avoid truncation effects in permutation
    vec4 ix=Pi.xzxz;
    vec4 iy=Pi.yyww;
    vec4 fx=Pf.xzxz;
    vec4 fy=Pf.yyww;
    vec4 i=permute(permute(ix)+iy);
    vec4 gx=2.*fract(i*.0243902439)-1.;// 1/41 = 0.024...
    vec4 gy=abs(gx)-.5;
    vec4 tx=floor(gx+.5);
    gx=gx-tx;
    vec2 g00=vec2(gx.x,gy.x);
    vec2 g10=vec2(gx.y,gy.y);
    vec2 g01=vec2(gx.z,gy.z);
    vec2 g11=vec2(gx.w,gy.w);
    vec4 norm=1.79284291400159-.85373472095314*
    vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11));
    g00*=norm.x;
    g01*=norm.y;
    g10*=norm.z;
    g11*=norm.w;
    float n00=dot(g00,vec2(fx.x,fy.x));
    float n10=dot(g10,vec2(fx.y,fy.y));
    float n01=dot(g01,vec2(fx.z,fy.z));
    float n11=dot(g11,vec2(fx.w,fy.w));
    vec2 fade_xy=fade(Pf.xy);
    vec2 n_x=mix(vec2(n00,n01),vec2(n10,n11),fade_xy.x);
    float n_xy=mix(n_x.x,n_x.y,fade_xy.y);
    return 0.,.1,2.3*n_xy;//smoothstep(0.,0.1,2.3*n_xy);
}

vec3 rand(vec2 co){
    co=vec2(co.x,co.y/2.);
    float r = cnoise(co*80.,12.+cnoise(co*2.*80.,122.));
    float g = cnoise(co*80.,8.+cnoise(co*2.*80.,83.));
    float b = cnoise(co*80.,210.+cnoise(co*2.*80.,-210.));
    return vec3(r,g,b);
    // co=vec2(floor(co.x*resX)/resX,floor(co.y*resY)/resY);
    
    // float r=fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43558.5453);
    // float g=fract(sin(dot(co.xy,vec2(12.9898,78.233)))*45758.5453);
    // float b=fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);
    // return vec3(r,g,b);
}

float depthAt(vec2 co){
    //float wallD = u_Wdepth;
    //float t=u_time/8.;
    //float d=sqrt((co.x-.5)*(co.x-.5)+(co.y-.5)*(co.y-.5));
    //return max(-co.y/4.,wallD);

    //return (sin((d-t)*10.)-1.)/100.;
    return (-1.+texture2D(u_WdepthTexture,vec2(co.x,co.y)).x)*bandWPropotion/5.;
}

void main(){
    vec2 st=gl_FragCoord.xy/u_resolution;
    //st -= u_mouse/u_resolution;


    bool end=false;
    bool leftOrRight=sign(st.x-.5)==-1.;
    for(int i=0;i<20;++i)
    {
        if(!end){
            if(abs(st.x-.5)<=bandW/(resX*2.)){
                gl_FragColor=vec4(rand(st),1);
                end=true;
            }else if(sign(st.x-.5)==-1.&&!leftOrRight){
                gl_FragColor=vec4(rand(st),1);
                end=true;
            }else if(!(sign(st.x-.5)==-1.)&&leftOrRight){
                //gl_FragColor=vec4(.63,.1,.1,1);
                
                float y=1.+(st.x-1.)*(1./((.5-bandWPropotion/2.)*2.));
                float depth=depthAt(vec2(y,st.y));
                st=vec2(st.x-(bandW/resX)+depth,st.y);
                gl_FragColor=vec4(rand(st),1);
                end=true;
                
            }
            else{
                if(sign(st.x-.5)==-1.){
                    float y=st.x*(1./((.5-bandWPropotion/2.)*2.));
                    //float depth=-texture2D(u_tex0,vec2(y,st.y)).x*bandWPropotion/20.;
                    //depth=floor(depth*resX)/resX;
                    float depth=depthAt(vec2(y,st.y));
                    st=vec2(st.x+(bandW/resX)-depth,st.y);
                    
                }else{
                    float y=1.+(st.x-1.)*(1./((.5-bandWPropotion/2.)*2.));
                    //float depth=texture2D(u_tex0,vec2(y,st.y)).x*bandWPropotion/20.;
                    //depth=floor(depth*resX)/resX;
                    float depth=depthAt(vec2(y,st.y));
                    st=vec2(st.x-(bandW/resX)+depth,st.y);
                    
                }
            }
            // if(st.x<=bandW/(resX*2.)){
                //     gl_FragColor=vec4(rand(st),1);
                //     end=true;
            // }else{
                
                //     float y=1.+(st.x-1.)*(1./((.5-bandWPropotion/2.)*2.));
                //     float depth=depthAt(vec2(y,st.y));//texture2D(u_tex0,vec2(y,st.y)).x*bandWPropotion/20.;
                
                //     //depth=floor(depth*resX)/resX;
                //     st=vec2(st.x-(bandW/resX)+depth,st.y);
                
            // }
            
        }
    }

    
}