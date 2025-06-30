interface user {
    id?: number | null;
    username?: string;
    phoneNumber?: string;
    email?: string;
    password?: string;
    gender?: number;
    avatar?: string;
    userStatus?:boolean;
    userType?:number;
    introduction?: string;
    createTime?: string;
    updateTime?: string;
    updateBy?: string;
    accessToken?: string; // 用户 token 值
    code?: string; // 用户的验证码
    role?: string; // 角色
}

// 登录参数
interface LoginParams {
    account: string;
    password: string;
    isAdmin: boolean;
}

export {
    user,
    LoginParams,
}
