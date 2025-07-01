import React from 'react';
import { useStore } from '@hooks/useStore';
import { useAppContext } from '@hooks/useAppContext';
import {weiYan} from "@type/weiYan";


interface ProcessProps {
    treeHoleList: weiYan[];
    onDeleteTreeHole?: (id: number | null) => void;
}
// 删除图标 SVG
const DeleteIcon: React.FC = () => (
    <svg viewBox="0 0 1024 1024" width="16" height="16" style={{ verticalAlign: '-3px' }} className="inline-block fill-lightRed">
        <path d="M921.1392 155.392h-270.592v-48.2816c0-22.7328-18.432-41.1648-41.1648-41.1648H426.3424a41.1648 41.1648 0 0 0-41.1648 41.1648v48.2816H110.6432c-14.1312 0-25.6 11.4688-25.6 25.6s11.4688 25.6 25.6 25.6h810.496c14.1312 0 25.6-11.4688 25.6-25.6s-11.4688-25.6-25.6-25.6zM170.8032 260.0448v592.8448c0 50.8928 41.2672 92.16 92.16 92.16h500.6848c50.8928 0 92.16-41.2672 92.16-92.16V260.0448H170.8032z m249.1392 462.7968c0 14.1312-11.4688 25.6-25.6 25.6s-25.6-11.4688-25.6-25.6V443.0848c0-14.1312 11.4688-25.6 25.6-25.6s25.6 11.4688 25.6 25.6v279.7568z m243.1488 0c0 14.1312-11.4688 25.6-25.6 25.6s-25.6-11.4688-25.6-25.6V443.0848c0-14.1312 11.4688-25.6 25.6-25.6s25.6 11.4688 25.6 25.6v279.7568z" />
    </svg>
);

const Process: React.FC<ProcessProps> = ({ treeHoleList, onDeleteTreeHole }) => {

    const {state}  = useStore();
    const {common,time} = useAppContext();
    if (!treeHoleList || treeHoleList.length === 0) {
        return null;
    }

    return (
        <div>
            {/* 时间线容器 */}
            <div className="font-optima relative ml-5 pl-5 pr-5 pt-[50px] pb-[10px] border-l-2 border-lightGreen">
                {/* 顶部的红色闪烁圆点 */}
                <div className="absolute top-[15px] left-[-0.5px] transform -translate-x-1/2 w-[14px] h-[14px] border-[3px] border-maxLightRed rounded-full bg-white animate-weiYanShadowFlashing-1.5-infinte"></div>

                {/* 遍历树洞列表 */}
                {treeHoleList.map((treeHole, idx) => (
                    <div key={`${treeHole.id}_${idx}`} className=" relative m-[9px] text-fontColor">
                        {/* 时间线上的蓝色圆点 */}
                        <div className="absolute top-[5px] left-[-34.5px] w-[10px] h-[10px] border-2 border-blue-500 rounded-full bg-white content-['']"></div>
                        {/* 时间和删除按钮 */}
                        <div className="mb-1">
              <span>
                {time.getDateDiff(treeHole.createTime)}
              </span>
                            {/* 条件渲染删除按钮 */}
                            {!common.isEmpty(state.currentUser) && state.currentUser.id === treeHole.userId && (
                                <span
                                    onClick={()=>{
                                        if(onDeleteTreeHole) {
                                            onDeleteTreeHole(treeHole.id)
                                        }
                                    }}
                                    className="ml-[10px] cursor-pointer"
                                >
                  <DeleteIcon />
                </span>
                            )}
                        </div>
                        {/* 内容区域 */}
                        <div
                            className="p-[12px_15px] m-[10px_0_15px] rounded-[10px] bg-[rgba(66,139,202,0.2)]"
                            dangerouslySetInnerHTML={{ __html: treeHole.content }}
                        ></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Process;
