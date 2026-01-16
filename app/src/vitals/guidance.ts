/**
 * Guidance Messages (Vietnamese)
 * Migrated from AGOLOS/ZenOne
 */

import type { ReasonCode } from './reasons';

export function reasonsToGuidanceVi(reasons: ReasonCode[]): string[] {
    const out: string[] = [];
    if (reasons.includes('FACE_LOST')) out.push('Đưa mặt vào khung hình và giữ ổn định.');
    if (reasons.includes('LOW_LIGHT')) out.push('Tăng ánh sáng phía trước mặt (đèn/ánh sáng màn hình 1 chút).');
    if (reasons.includes('MOTION_HIGH')) out.push('Giữ đầu ổn định ~5–10 giây để đo chính xác.');
    if (reasons.includes('FPS_UNSTABLE')) out.push('Đóng app nền / giảm chất lượng camera để ổn định khung hình.');
    if (reasons.includes('SATURATION')) out.push('Giảm nguồn sáng quá gắt (tránh bị cháy sáng).');
    if (reasons.includes('INSUFFICIENT_WINDOW')) out.push('Giữ nguyên tư thế thêm một lúc để đủ dữ liệu.');
    if (reasons.includes('SNR_LOW')) out.push('Tiến gần camera hơn và tránh rung/lóa sáng.');
    return out;
}

export function reasonsToGuidanceEn(reasons: ReasonCode[]): string[] {
    const out: string[] = [];
    if (reasons.includes('FACE_LOST')) out.push('Position your face in the frame and hold steady.');
    if (reasons.includes('LOW_LIGHT')) out.push('Increase lighting in front of your face.');
    if (reasons.includes('MOTION_HIGH')) out.push('Hold still for 5-10 seconds for accurate reading.');
    if (reasons.includes('FPS_UNSTABLE')) out.push('Close background apps to stabilize frame rate.');
    if (reasons.includes('SATURATION')) out.push('Reduce harsh lighting (avoid overexposure).');
    if (reasons.includes('INSUFFICIENT_WINDOW')) out.push('Hold position a bit longer for sufficient data.');
    if (reasons.includes('SNR_LOW')) out.push('Move closer to camera and avoid glare.');
    return out;
}
