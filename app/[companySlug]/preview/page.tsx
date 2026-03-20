import PublicCareersPage from '../careers/page'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preview - Whitecarrot Builder',
  robots: {
    index: false,
    follow: false
  }
}

export default async function PreviewPage(props: { params: Promise<{ companySlug: string }>, searchParams: Promise<any> }) {
  // Pass the searchParams with preview=true manually to the PublicCareersPage
  const searchParams = await props.searchParams
  return <PublicCareersPage params={props.params} searchParams={Promise.resolve({ ...searchParams, preview: 'true' })} />
}
