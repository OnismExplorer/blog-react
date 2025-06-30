
/**
  * 历史访问 IP 数量统计
  */
interface historyCount {
    ip:string;
    num:number;
}

/**
  * 访问用户信息
  */
interface historyUser {
    avatar:string;
    username:string;
}

/**
  * 访问用户省份信息
  */
interface historyProvince {
    province:string;
    num:number;
}

/**
  * 访问用户国家省份城市信息
  */
interface historyNation extends historyProvince {
    nation:string;
    city:string;
}

export interface historyInfo {
    ip_count_yesterday: number; // 昨天访问 ip 数量
    ip_count_today: number; // 今天访问 ip 数量
    ip_history_ip: historyCount[]; // 历史访问 ip 及数量
    username_today: historyUser[]; // 今天访问的用户信息
    username_yesterday: historyUser[]; // 昨天访问的用户信息
    province_today: historyProvince[];
    ip_history_province: historyNation[];
    ip_history_count:number;
}
