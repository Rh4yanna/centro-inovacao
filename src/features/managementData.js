import { meetings } from './institutions/data';
export const initialMeetings = [...meetings.map(m=>({...m,id:String(m.id),date:`2026-09-${m.day}`,status:'Agendada',link:'',password:''})),
  ...[
    ['Workshop: Líderes do Ecossistema','2026-09-20','08:30','Auditório',9,'Agendada'],
    ['Reunião de Alinhamento Mensal','2026-10-01','13:00','Sala de Reuniões',6,'Agendada'],
    ['Reunião sobre IA','2026-09-10','09:45','Sala de Reuniões 4',35,'Realizada'],
    ['Comitê de Incubadoras','2026-09-08','11:00','Centro de Conferências',48,'Realizada'],
    ['Encontro com Reitores','2026-09-08','09:00','Sala de Reuniões 2',6,'Cancelada'],
    ['Workshop: Ensino no Mundo da IA','2026-09-06','14:00','Gabinete 03',85,'Realizada'],
  ].map(([name,date,time,place,count,status],i)=>({id:String(i+5),name,date,time,place,count,status,description:'Encontro dos participantes do ecossistema.',address:'Centro de Inovação',link:'',password:''}))];
export const initialRepresentatives = [
  ['Mariana Tchermann Pereira','Coordenadora','1','Ativo'],['Pietro Borges','Gerente Comercial','3','Ativo'],['João Mário Marques','Diretor de Negócios','2','Inativo'],['Martha Albuquerque Ramos','Secretária-Chefe','5','Ativo'],['Silmara Aparecida Ramos Silva','Vice-Presidente','5','Ativo'],['Fernando Tavares','Professor','4','Inativo'],['Larissa Ribeiro Nogueira','Coordenadora de Projetos','8','Inativo'],['Danilo Lopes Moreira','CEO','6','Ativo'],['Gabriel Vilhena','Reitor','9','Ativo'],['Rita Fagundes de Xavier','Pesquisadora','8','Ativo'],
].map(([name,role,institutionId,status],i)=>({id:String(i+1),name,role,institutionId,status,cpf:String(10000000000+i),email:`representante${i+1}@exemplo.com`,phone:'(42) 99999-0000',street:'',number:'',neighborhood:'',city:'',state:'',zip:'',complement:''}));
