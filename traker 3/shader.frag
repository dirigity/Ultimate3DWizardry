#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

uniform float u_CamX;
uniform float u_CamY;
uniform float u_CamZ;

// float u_CamX=0.;
// float u_CamY=0.;
// float u_CamZ=-5.;

const float CEROMat=.001;
const float CEROLight=.0001;
const int N=2;
const int M=1;
const int SphereCode=0;
const int CubeCode=1;

struct Obj{
    vec3 col;
    int distType;
    vec3 pos;
    float size;
};

Obj HitObj;

float d(Obj o,vec3 p){
    if(o.distType==SphereCode){
        return length(p-o.pos)-o.size;
    }
    return 0.;
}

float distanceToScene(Obj Scene[N],vec3 point){
    float ret=100000.;
    for(int i=0;i<N;i++){
        float dist=d(Scene[i],point);
        if(ret>dist){
            ret=dist;
            HitObj=Scene[i];
            //norm = (point-Scene[i].pos);
            //norm = norm / length(norm);
        }
    }
    return ret;
}

float distanceToLight(vec3 Light,vec3 point){
    
    return length(Light-point);
}

vec3 colOfVec(vec3 dir,vec3 point,Obj SceneObj[N],vec3 Lights[M]){
    float d=distanceToScene(SceneObj,point);
    int j=0;
    const int sky=100;
    for(int i=0;i<sky;i++){
        if(d>CEROMat){
            point=point-((dir/length(dir))*(d-CEROLight));
            j++;
            d=distanceToScene(SceneObj,point);
        }
    }
    
    if(j==sky){
        return vec3(0.,0.,0.);
    }
    
    // goToLight
    
    float Iluminance=0.;
    
    vec3 hit=point;
    vec3 norm=point-HitObj.pos;
    norm = norm/length(norm);
    
    for(int m=0;m<M;m++){
        point=hit;
        dir=point-Lights[m];
        dir = dir/length(dir);
        int j=0;
        d=min(distanceToScene(SceneObj,point),distanceToLight(Lights[m],point));
        for(int i=0;i<sky;i++){
            if(d>CEROLight){
                point=point-dir*d;
                j++;
                d=min(distanceToScene(SceneObj,point),distanceToLight(Lights[m],point));
            }
        }
        if(length(point-Lights[m])<CEROLight){
            Iluminance+=abs(dot(dir,norm)/length(dir)) * 1./pow(length(hit-point),1.);
        }
    }
    
    //return vec3(j/10.);
    return HitObj.col*Iluminance*10.;
}

void main(){
    vec2 st=gl_FragCoord.xy/u_resolution;
    st=st-.5;
    vec2 ScreenSpace=vec2(-st.x*16.,-st.y*9.);
    Obj Scene[N];
    Obj Sphere;
    Sphere.col=vec3(.7608,.549,.1529);
    Sphere.distType=SphereCode;
    Sphere.pos=vec3(0,0,13);
    Sphere.size=1.;
    Scene[0]=Sphere;
    
    Obj Ground;
    Ground.col=vec3(0.2667, 0.7333, 0.6314);
    Ground.distType=SphereCode;
    Ground.pos=vec3(0,-10000,0);
    Ground.size=9999.;
    Scene[1]=Ground;
    
    vec3 lights[M];
    lights[0]=vec3(0,5,0);
    //st -= u_mouse/u_resolution;
    
    vec3 col=colOfVec(vec3(ScreenSpace.x-u_CamX,ScreenSpace.y-u_CamY,u_CamZ),vec3(u_CamX,u_CamY,u_CamZ),Scene,lights);
    
    gl_FragColor=vec4(col,1.);
    //gl_FragColor=vec4(u_CamX, u_CamY, u_CamZ ,1.);
    
}