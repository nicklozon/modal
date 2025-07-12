<script>
  import { Test } from '@inertiaui/modal-svelte'

  let statevar = $state('Emit Var')

  $effect(() => console.log(statevar) )

  setTimeout(() => statevar = 'Emit Var - updated')
</script>

<Test />
