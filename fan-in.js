
module.exports = FanOutput

function FanOutput () {
  this.paused = true
  this.buffer = []
  this.ended = false
  this.inputs = []
}

//this should _only_ be called by the FanInputs
FanOutput.prototype.write = function (data) {
  if(!this.dest.paused && !this.buffer.length)
    this.dest.write(data)
  else
    this.buffer.push(data)
}


FanOutput.prototype.resume = function () {
  this.paused = false
  while(!this.dest.paused && this.buffer.length)
    this.dest.write(this.buffer.shift())
  if(!this.dest.paused) {
    for(var k in this.inputs)
      if(this.inputs[k].paused)
        this.inputs[k].resume()
  }
}

FanOutput.prototype.createInput = function () {
  var input = new FanInput(this, this.inputs.length)
  this.inputs.push(input)
  return input
}

FanOutput.prototype.pipe = function (dest) {
  this.dest = dest
  dest.source = this
  if(!dest.paused) this.resume()
}

function FanInput (output, id) {
  this.output = output
  this.id = id
  this.paused = this.output.paused
}

FanInput.prototype.resume = function () {
  this.paused = false
  if(this.source)
    this.source.resume()
}

FanInput.prototype.write = function (data) {
  //add to output buffer and pause if they are paused.
  this.output.write(data)
  this.paused = this.output.paused
}

//end isn't passed on to the output, it just removes one substream.
FanInput.prototype.end = function (err) {
  this.ended = err || true
  delete this.output[this.id]
}

