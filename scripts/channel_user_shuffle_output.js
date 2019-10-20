const fetch = require('node-fetch');

const TOKEN = process.env.HUBOT_SLACK_TOKEN;
const CHANNEL_ID = 'INPUT_CHANNEL_ID';
const SLACK_API_BASE = 'https://slack.com/api';

const random = (n) => Math.floor(Math.random() * n)

//チャンネル情報を取得する
const fetchChannel = async () => {
  const res = await fetch(`${SLACK_API_BASE}/channels.info?token=${TOKEN}&channel=${CHANNEL_ID}&pretty=1`)
  const data = await res.json()
  if (!data.ok) throw new Error(data.error);
  return data.channel
}

//上記で取得したチャンネルに入っているユーザ情報を取得する
function fetchMembers(ids) {
  return Promise.all(ids.map((id) => {
    return fetch(`${SLACK_API_BASE}/users.info?token=${TOKEN}&user=${id}&pretty=1`)
      .then(res => res.json())
      .then((res) => {
        if (!res.ok) throw new Error(res.error);
        return res.user;
      });
  }))
  .then(users => users.filter(x => !x.deleted));
}

//hubotへの入力
module.exports = (robot) => {
    robot.hear(/(ユーザをランダムに出力して)/i, (res) => {

(async () => {
   const channel = await fetchChannel()
   const members = await fetchMembers(channel.members)
   const real_names = members.map(x => x.real_name).sort()
	 let message = ''

   //メンバーをランダムソート
	 for (var i = members.length - 1; i >= 0; i--){
		// 0~iのランダムな数値を取得
	 var rand = Math.floor( Math.random() * ( i + 1 ) );
		// 配列の数値を入れ替える
	 [members[i], members[rand]] = [members[rand], members[i]]

	 }
  //指定したユーザIDとBOTユーザ以外を出力する
	members.forEach(member => {
		if (!member.is_bot && member.id !== "EXCLUDE_USER_ID") {
			message = `${message}${member.real_name}\n`
		}
	})
	res.send(message)

})()
   .catch(err => console.error(err));

  })
}
