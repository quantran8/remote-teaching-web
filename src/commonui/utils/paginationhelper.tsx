import { reqIgnore } from '@/commonui';

export class PaginationParams {
	@reqIgnore
	total: number;
	@reqIgnore
	current: number;
	@reqIgnore
	pageSize: number;
	showTotal: (total: any, range: any) => string = (total, range) => "pagination message to be changed"; //GLGlobal.intl.formatMessage({ id: GLLocale.Pagination }, { from: range[0], to: range[1], total });
	constructor(index: number = 1, limit: number = 10, total: number = 0) {
		this.current = index;
		this.pageSize = limit;
		this.total = total;
	}
	toRequest(searchParams?: object) {
		return {
			offset: (this.current - 1) * this.pageSize,
			limit: this.pageSize,
			...searchParams
		};
	}
}
