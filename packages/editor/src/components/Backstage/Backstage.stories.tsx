import React from 'react'

import { Backstage, IProps } from './'

import { exampleSolutions, exampleGistMetadata } from './MySolutions/MySolutions.stories'
import { exampleSamples } from './Samples/Samples.stories'

import { storiesOf } from '@storybook/react'

const voidFunc = () => {}
const defaultBackstageProps: IProps = {
  activeSolution: exampleSolutions[2],
  sharedGistMetadata: exampleGistMetadata,
  samplesByGroup: exampleSamples,
  solutions: exampleSolutions as ISolution[],
  createNewSolution: voidFunc,
  goBack: voidFunc,
  importGist: voidFunc,
  openGist: voidFunc,
  openSample: voidFunc,
  openSolution: voidFunc,
}

storiesOf('Backstage|All', module).add('basic', () => (
  <Backstage {...defaultBackstageProps} />
))
