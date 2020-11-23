import { NotificationType } from "./enum";
import { fmtMsg } from ".";
import { CommonLocale } from "@/locales/localeid";
import { VNode } from 'vue';

export class MessageHelper {
	static Message(type: NotificationType, message: string) {
		//const formatMSG = GLGlobal.intl.formatMessage;
		let title, icontype: string, color: string;
		switch (type) {
			case NotificationType.Warning:
				icontype = "exclamation-circle";
				color = "#F7931E";
				title = fmtMsg(CommonLocale.CommonWarningTitle);
				break;
			case NotificationType.Success:
				icontype = "check-circle";
				color = "#52c41a";
				title = fmtMsg(CommonLocale.CommonSuccessTitle);
				break;
			case NotificationType.Failed:
				icontype = "close-circle";
				color = "#f5222d";
				title = fmtMsg(CommonLocale.CommonFailedTitle);
				break;
		}

		// notification.open({
		// 	message: title,
		// 	duration: 3,
		// 	description: message,
		// 	icon: (h) => h(Icon, { props: { type: icontype } })
		// 	//icon: <Icon type={icontype} style={{ color: color }} theme="filled" />,
		// });
	}

	static ShowError(error?: { error: string; errorDescription: string; errorCode: string }) {
		if (!error) {
			return;
		}
		MessageHelper.Message(NotificationType.Failed, error.errorDescription);
	}

	static Confirm(content: string | VNode, onOk: any, onCancel: any = null, okText = null, cancelText = null) {
		const textOk = okText || "Yes";
		const textCancel = cancelText || "No";

		// Modal.confirm({
		// 	content: content,
		// 	onOk: onOk,
		// 	onCancel: onCancel,
		// 	okText: textOk,
		// 	cancelText: textCancel
		// } as ModalOptions);
	}
}
