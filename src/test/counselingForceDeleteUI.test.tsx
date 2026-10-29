import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { type HandwritingMemo } from "@/lib/counselingHandwriting";
const mock = vi.hoisted(()=>({ user: {uid:"a",getIdTokenResult:async()=>({claims:{role:"admin"}})}, confirmForceDelete: vi.fn(), forceDeleteConfirmed: vi.fn(), subscribePending: vi.fn() }));
vi.mock("@/lib/counselingHandwritingApi",()=>({handwritingApi:mock,handwritingError:()=>"error"}));
vi.mock("@/hooks/useAuth",()=>({useAuth:()=>({user:mock.user,loading:false})}));
import { ForceDeleteMemoButton } from "@/components/ForceDeleteMemoButton";
import { PendingHandwritingMemos } from "@/components/CounselingHandwritingEntry";
const memo: HandwritingMemo={id:"force",schemaVersion:1,targetType:"이용자",targetId:"synthetic",targetKey:"user:synthetic",counselingRecordId:"",createdBy:"a",updatedBy:"a",createdAt:null,updatedAt:null,revision:1,width:1600,height:1000,strokesJson:"[]",transcribedRevision:-1,transcribedAt:null};
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.clearAllMocks();});
it("FD1/FD2: pending list exposes only the normal open/transcription path",async()=>{
 mock.subscribePending.mockImplementation(receive=>{receive([memo]);return vi.fn();});
 render(<PendingHandwritingMemos targetName={()=>"synthetic"}/>);
 expect(await screen.findByRole("button",{name:"synthetic 열기"})).toBeEnabled();
 expect(screen.queryByRole("button",{name:"옮겨 적은 후 삭제"})).not.toBeInTheDocument();
 expect(mock.confirmForceDelete).not.toHaveBeenCalled();expect(mock.forceDeleteConfirmed).not.toHaveBeenCalled();
});
it.each([[false,false,1],[true,false,2]])("FD3/FD4: cancel first=%s second=%s retains memo",async(first,second,calls)=>{
 const confirm=vi.spyOn(window,"confirm").mockReturnValueOnce(first).mockReturnValueOnce(second);const deleted=vi.fn();
 render(<ForceDeleteMemoButton memo={memo} uid="a" onDeleted={deleted}/>);
 fireEvent.click(screen.getByRole("button"));await waitFor(()=>expect(confirm).toHaveBeenCalledTimes(calls));
 expect(mock.confirmForceDelete).not.toHaveBeenCalled();expect(mock.forceDeleteConfirmed).not.toHaveBeenCalled();expect(deleted).not.toHaveBeenCalled();
});
it("failure keeps memo and reports recovery guidance",async()=>{
 vi.spyOn(window,"confirm").mockReturnValue(true);mock.confirmForceDelete.mockRejectedValue(new Error("stale"));const deleted=vi.fn();
 render(<ForceDeleteMemoButton memo={memo} uid="a" onDeleted={deleted}/>);fireEvent.click(screen.getByRole("button"));
 expect(await screen.findByRole("alert")).toHaveTextContent("손글씨가 변경되었거나 권한 상태가 달라졌을 수 있습니다");expect(deleted).not.toHaveBeenCalled();
});
