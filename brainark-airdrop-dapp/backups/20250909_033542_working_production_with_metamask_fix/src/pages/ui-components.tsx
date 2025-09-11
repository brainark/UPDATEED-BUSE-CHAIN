import UIShowcase from '@/components/ui/UIShowcase'
import { NextPage } from 'next'
import Head from 'next/head'

const UIComponentsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>UI Components | BrainArk DApp</title>
        <meta name="description" content="Elegant UI components for BrainArk DApp using Framer Motion and Tailwind CSS" />
      </Head>
      
      <UIShowcase />
    </>
  )
}

export default UIComponentsPage
