module.exports = {
	name: 'messageCreate',
	once: false,
	execute(msg) {
		function createRole(sex){
      let role = msg.member.guild.roles.cache.find(role=>role.name === sex)
      return role
    }
    if(msg.channelId !== '873862878959108106') return 
    if(msg.guild.ownerId === msg.author.id) return msg.reply({content:'방장은 사용 못합니다.',ephemeral:true})
    if(msg.author.bot) return
    let 양식 = msg.content.split(' ')
    let 성별 = ['남자','여자','남','여','지인']
    if(
      msg.member.roles.cache.some(e=>e.name ==='남자') 
      || msg.member.roles.cache.some(e=>e.name ==='여자')
      || msg.member.roles.cache.some(e=>e.name ==='지인')
      || msg.member.roles.cache.some(e=>e.name ==='관리자')
      ) return msg.reply({content:'이미 역할을 소지하고 있습니다.', ephemeral:true})
    if(양식.length !== 3) return msg.reply('양식 예시: 홍길동 23 남 or 아무개 25 여')
    if(isNaN(parseInt(양식[1]))) return msg.reply('양식의 나이 칸이 올바르지 않습니다 본인의 나이를 적어주세요, 예시 : 홍길동 23 남')
    if(!성별.includes(양식[2])) return msg.reply('양식의 성별 칸이 올바르지 않습니다 남 또는 여로 바꿔주세요, 예시 : 홍길동 23 남')
    if(양식[2].includes('남'||'남자' && msg.guild.roles.cache.some(e=>e.name ==='남자'))){
      msg.member.roles.add(createRole('남자'))
    }else if(양식[2].includes('여'||'여자') && msg.guild.roles.cache.some(e=>e.name ==='여자')){
      msg.member.roles.add(createRole('여자'))
    }else if(msg.guild.roles.cache.some(e=>e.name ==='지인')){
      msg.member.roles.add(createRole('지인'))
    }
    양식.pop()
    let 닉네임 = 양식.join().replace(/,/g , " ")  
    msg.member.setNickname(닉네임).then(()=>{
      msg.reply('권한이 주어졌습니다. 앞으로 잘 부탁드립니다')
      msg.react('💋')
    })
	},
};