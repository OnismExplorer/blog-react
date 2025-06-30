import {Tag} from "antd";
import React, {useEffect, useState} from "react";
import {useAppContext} from "@hooks/useAppContext";
import {historyInfo} from "@type/historyInfo";
import {getHistoryInfo} from "@api/webInfo";

/**
 * 系统首页
 */
const Main: React.FC = () => {

    const {common} = useAppContext();
    const [historyInfo, setHistoryInfo] = useState<historyInfo>({
        ip_count_yesterday: 0,
        ip_count_today: 0,
        ip_history_ip: [],
        username_today: [],
        username_yesterday: [],
        province_today: [],
        ip_history_province: [],
        ip_history_count: 0
    });

    useEffect(() => {
        fetchHistoryInfo();
    }, []);

    /**
     * 获取访问记录
     */
    const fetchHistoryInfo = () => {
        getHistoryInfo()
            .then(res => {
                const result = res.data;
                if (!common.isEmpty(result)) {
                    setHistoryInfo(result);
                }
            })
    }

    /**
     * 获取表格数据
     * @param title 表格标题
     * @param columns 表头字段
     * @param datas 数据内容，二维数组表示多行多列
     */
    const getTableData = (title: string, columns: string[], datas: (string | number)[][]) => {
        return (
            <>
                <div className="text-base font-bold mr-2.5 mt-2.5">{title}</div>
                <div className="mt-3">
                    <div className="overflow-x-auto scrollbar-none">
                        <table className="min-w-full bg-white rounded-lg">
                            <thead className="bg-gray-100">
                            <tr>
                                {columns.map((column: string, idx) => (
                                    <th
                                        key={`head-${idx}`}
                                        className="px-4 py-2 text-center w-[120px]"
                                    >
                                        {column}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {datas.map((row, rowIndex) => (
                                <tr
                                    key={`row-${rowIndex}`}
                                    className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
                                >
                                    {row.map((cell, colIndex) => {
                                        const columnName = columns[colIndex].toLowerCase();
                                        const isImage = columnName.includes('avatar') || columnName.includes('头像');
                                        return (
                                            <td
                                                key={`cell-${rowIndex}-${colIndex}`}
                                                className="px-4 py-2 text-center"
                                            >
                                                {isImage && typeof cell === 'string' ? (
                                                    <img
                                                        src={cell}
                                                        alt="头像"
                                                        className="w-8 h-8 rounded-full mx-auto transition-all duration-500 hover:rotate-[360deg]"
                                                    />
                                                ) : (
                                                    cell
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="select-none">
            <div>
                <Tag
                    className="font-custom text-base flex flex-row gap-2 px-2 items-center w-full text-left bg-lightYellow border-none h-10 leading-10 m-2 text-fontColor">
                    <svg viewBox="0 0 1024 1024" width="20" height="20" style={{verticalAlign: "-4px"}}>
                        <path
                            d="M767.1296 808.6528c16.8448 0 32.9728 2.816 48.0256 8.0384 20.6848 7.1168 43.52 1.0752 57.1904-15.9744a459.91936 459.91936 0 0 0 70.5024-122.88c7.8336-20.48 1.0752-43.264-15.9744-57.088-49.6128-40.192-65.0752-125.3888-31.3856-185.856a146.8928 146.8928 0 0 1 30.3104-37.9904c16.2304-14.5408 22.1696-37.376 13.9264-57.6a461.27104 461.27104 0 0 0-67.5328-114.9952c-13.6192-16.9984-36.4544-22.9376-57.0368-15.8208a146.3296 146.3296 0 0 1-48.0256 8.0384c-70.144 0-132.352-50.8928-145.2032-118.7328-4.096-21.6064-20.736-38.5536-42.4448-41.8304-22.0672-3.2768-44.6464-5.0176-67.6864-5.0176-21.4528 0-42.5472 1.536-63.232 4.4032-22.3232 3.1232-40.2432 20.48-43.52 42.752-6.912 46.6944-36.0448 118.016-145.7152 118.4256-17.3056 0.0512-33.8944-2.9696-49.3056-8.448-21.0432-7.4752-44.3904-1.4848-58.368 15.9232A462.14656 462.14656 0 0 0 80.4864 348.16c-7.6288 20.0192-2.7648 43.008 13.4656 56.9344 55.5008 47.8208 71.7824 122.88 37.0688 185.1392a146.72896 146.72896 0 0 1-31.6416 39.168c-16.8448 14.7456-23.0912 38.1952-14.5408 58.9312 16.896 41.0112 39.5776 79.0016 66.9696 113.0496 13.9264 17.3056 37.2736 23.1936 58.2144 15.7184 15.4112-5.4784 32-8.4992 49.3056-8.4992 71.2704 0 124.7744 49.408 142.1312 121.2928 4.9664 20.48 21.4016 36.0448 42.24 39.168 22.2208 3.328 44.9536 5.0688 68.096 5.0688 23.3984 0 46.4384-1.792 68.864-5.1712 21.3504-3.2256 38.144-19.456 42.7008-40.5504 14.8992-68.8128 73.1648-119.7568 143.7696-119.7568z"
                            fill="#8C7BFD"></path>
                        <path
                            d="M511.8464 696.3712c-101.3248 0-183.7568-82.432-183.7568-183.7568s82.432-183.7568 183.7568-183.7568 183.7568 82.432 183.7568 183.7568-82.432 183.7568-183.7568 183.7568z m0-265.1648c-44.8512 0-81.3568 36.5056-81.3568 81.3568S466.9952 593.92 511.8464 593.92s81.3568-36.5056 81.3568-81.3568-36.5056-81.3568-81.3568-81.3568z"
                            fill="#FFE37B"></path>
                    </svg>
                    <span>统计信息</span>
                </Tag>

                {/*总览*/}
                <div>
                    <div
                        className="my-4 mx-auto font-custom text-base w-[100px] text-center py-[10px] px-5 bg-lightGreen text-white font-bold rounded-md">总览
                    </div>
                    <div className="relative w-full h-[70px] font-custom font-bold">
                        <div
                            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                            <div className="leading-[35px] text-base">总访问量：</div>
                            <span className="mt-1 bg-orangeRed p-1 rounded-md text-white">每个 IP 每天记录一次</span>
                        </div>
                        <span
                            className="absolute left-1/2 top-1/3 transform translate-x-[calc(50%+80px)] -translate-y-1/4 text-maxLightRed font-bold text-2xl leading-10">{historyInfo.ip_history_count}</span>
                    </div>
                    <div className="font-custom flex flex-row text-center mt-5 mx-auto ml-3 justify-center">
                        {/*省份访问 TOP 10*/}
                        <div className="mr-20 flex-col">
                            {getTableData("省份访问 TOP 10", ['排名', '省份', '城市', '数量'], historyInfo.ip_history_province.map((item, index) => [
                                index + 1,
                                item.province,
                                item.city,
                                item.num
                            ]))}
                        </div>

                        {/*IP 访问 TOP 10*/}
                        <div className="flex-col">
                            {getTableData("IP 访问 TOP 10", ['排名', 'IP', '数量'], historyInfo.ip_history_ip.map((item, index) => [
                                index + 1,
                                item.ip,
                                item.num
                            ]))}
                        </div>
                    </div>
                </div>

                {/*今日访问*/}
                <div>
                    <div
                        className="my-5 mx-auto font-custom text-base w-[120px] text-center py-[10px] px-5 bg-lightGreen text-white font-bold rounded-md">今日访问
                    </div>
                    <div className="relative w-full h-[30px] font-custom font-bold">
                        <div
                            className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                            <div className="leading-[35px] text-base">今日访问量：</div>
                        </div>
                        <span
                            className="absolute left-1/2 top-[20%] transform translate-x-[calc(50%+50px)] -translate-y-1/3 text-maxLightRed font-bold text-2xl leading-[35px]">{historyInfo.ip_count_today}</span>
                    </div>
                    <div className="font-custom flex flex-row text-center mt-3 mx-auto ml-3 justify-center">
                        <div className="mr-20 flex-col">
                            {getTableData("今日访问省份统计", ['排名', '省份', '数量'], historyInfo.province_today.map((item, index) => [
                                index + 1,
                                item.province,
                                item.num
                            ]))}
                        </div>

                        <div className="flex-col">
                            {getTableData("今日访问用户", ['头像', '用户'], historyInfo.username_today.map((item) => [
                                item.avatar,
                                item.username
                            ]))}
                        </div>
                    </div>
                </div>

                {/*昨日访问*/}
                <div>
                    <div
                        className="my-5 mx-auto font-custom text-base w-[120px] text-center py-[10px] px-5 bg-lightGreen text-white font-bold rounded-md">昨日访问
                    </div>
                    <div className="relative w-full h-[30px] font-custom font-bold">
                        <div
                            className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                            <div className="leading-[35px] text-base">昨日访问量：</div>
                        </div>
                        <span
                            className="absolute left-1/2 top-[20%] transform translate-x-[calc(50%+50px)] -translate-y-1/3 text-maxLightRed font-bold text-2xl leading-[35px]">{historyInfo.ip_count_yesterday}</span>
                    </div>
                    <div className="font-custom flex flex-row text-center mt-3 mx-auto ml-3 justify-center">

                        <div className="flex-col">
                            {getTableData("昨日访问用户", ['头像', '用户'], historyInfo.username_yesterday.map((item) => [
                                item.avatar,
                                item.username
                            ]))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Main;
